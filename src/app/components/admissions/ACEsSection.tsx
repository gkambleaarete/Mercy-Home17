import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Plus, ChevronDown, ChevronUp, Pencil, Trash2 } from "@/app/lib/lucide-icons";
import { ACEsAssessmentDialog, ACEsAssessmentData } from "./ACEsAssessmentDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { formatMdy } from "../../lib/dateFormat";

export function ACEsSection() {
    const [acesRecords, setAcesRecords] = useState<ACEsAssessmentData[]>([
        {
            id: 1,
            date: "2025-12-15",
            test: "ACEs",
            raterType: "Youth",
            rater: "Marcus Johnson",
            examiner: "Dr. Sarah Thompson",
            questions: [
                { id: "q1", question: "Did a parent or other adult in the household often or very often swear at you, insult you, put you down, or humiliate you?", answer: "Yes" },
                { id: "q2", question: "Did a parent or other adult in the household often or very often hit, kick, beat, or physically hurt you in any way?", answer: "Yes" },
                { id: "q3", question: "Did an adult or person over 5 years older than you ever touch you sexually, try to make you touch them sexually or force you to have sex?", answer: "No" },
                { id: "q4", question: "Did you often or very often feel that no adult in your household made feel safe and protected?", answer: "Yes" },
                { id: "q5", question: "Did you often or very often feel that no adult in your household made sure your basic needs were met?", answer: "No" },
                { id: "q6", question: "Were your parents ever separated or divorced?", answer: "Yes" },
                { id: "q7", question: "Did your parents or other adults in your home slap, hit, kick, punch, or beat each other up?", answer: "No" },
                { id: "q8", question: "Did you live with anyone who was a problem drinker or alcoholic, used illegal street drugs, or abused prescription medications?", answer: "No" },
                { id: "q9", question: "Did you live with anyone who was depressed, mentally ill, or suicidal?", answer: "No" },
                { id: "q10", question: "Did you live with anyone who served time or was sentenced to serve time in a prison, jail, or other correctional facility?", answer: "No" }
            ],
            totalAces: 4,
            comments: "Youth was engaged and cooperative during assessment."
        }
    ]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<ACEsAssessmentData | null>(null);
    const [sortColumn, setSortColumn] = useState<'date' | 'examiner'>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [viewingRecord, setViewingRecord] = useState<ACEsAssessmentData | null>(null);

    const handleCreate = () => {
        setEditingRecord(null);
        setDialogOpen(true);
    };

    const handleEdit = (record: ACEsAssessmentData) => {
        setEditingRecord(record);
        setDialogOpen(true);
    };

    const handleSave = (data: Omit<ACEsAssessmentData, "id" | "totalAces">) => {
        const totalAces = data.questions.filter(q => q.answer === "Yes").length;
        
        if (editingRecord) {
            setAcesRecords(records => 
                records.map(r => 
                    r.id === editingRecord.id 
                        ? { ...data, id: r.id, totalAces } 
                        : r
                )
            );
        } else {
            const newId = acesRecords.length > 0 ? Math.max(...acesRecords.map(r => r.id)) + 1 : 1;
            setAcesRecords(records => [...records, { ...data, id: newId, totalAces }]);
        }
        setDialogOpen(false);
        setEditingRecord(null);
    };

    const handleDeleteClick = (id: number) => {
        setRecordToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (recordToDelete !== null) {
            setAcesRecords(records => records.filter(r => r.id !== recordToDelete));
            setRecordToDelete(null);
            setDeleteConfirmOpen(false);
        }
    };

    const handleSort = (column: 'date' | 'examiner') => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc');
        }
    };

    const handleViewDetails = (record: ACEsAssessmentData) => {
        setViewingRecord(record);
        setViewDialogOpen(true);
    };

    const sortedRecords = useMemo(() => {
        const sorted = [...acesRecords].sort((a, b) => {
            if (sortColumn === 'date') {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
            } else {
                return sortDirection === 'asc' 
                    ? a.examiner.localeCompare(b.examiner)
                    : b.examiner.localeCompare(a.examiner);
            }
        });
        return sorted;
    }, [acesRecords, sortColumn, sortDirection]);

    // Format date to UTC to prevent timezone shifting
    const formatDateUTC = (dateString: string) => {
        const date = new Date(dateString + 'T00:00:00Z');
        return formatMdy(date);
    };

    return (
        <div>
            <div 
                className="flex items-center justify-between mb-4"
                style={{ color: 'var(--slds-g-color-text-default)' }}
            >
                <h3 className="text-[13px] font-semibold">ACEs Assessments</h3>
                <Button
                    onClick={handleCreate}
                    className="h-9 px-4 text-[13px] font-medium rounded-full gap-2"
                    style={{
                        backgroundColor: '#145F33',
                        color: 'white'
                    }}
                >
                    <Plus className="h-4 w-4" />
                    Create
                </Button>
            </div>

            {acesRecords.length === 0 ? (
                <div 
                    className="text-center py-12 rounded"
                    style={{ 
                        backgroundColor: 'var(--slds-g-color-neutral-95)',
                        border: '1px solid var(--slds-g-color-border-base-1)',
                        color: 'var(--slds-g-color-text-weak)'
                    }}
                >
                    <p className="text-[13px]">No ACEs assessment records found.</p>
                </div>
            ) : (
                <div 
                    className="overflow-hidden rounded"
                    style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
                >
                    <table className="w-full text-[13px]">
                        <thead 
                            style={{ 
                                backgroundColor: 'var(--slds-g-color-neutral-95)',
                                borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                            }}
                        >
                            <tr>
                                <th 
                                    className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-gray-100"
                                    style={{ color: 'var(--slds-g-color-text-default)' }}
                                    onClick={() => handleSort('date')}
                                >
                                    <div className="flex items-center gap-1">
                                        Date
                                        {sortColumn === 'date' && (
                                            sortDirection === 'asc' 
                                                ? <ChevronUp className="h-4 w-4" />
                                                : <ChevronDown className="h-4 w-4" />
                                        )}
                                    </div>
                                </th>
                                <th 
                                    className="px-4 py-3 text-left font-semibold"
                                    style={{ color: 'var(--slds-g-color-text-default)' }}
                                >
                                    Test
                                </th>
                                <th 
                                    className="px-4 py-3 text-left font-semibold cursor-pointer hover:bg-gray-100"
                                    style={{ color: 'var(--slds-g-color-text-default)' }}
                                    onClick={() => handleSort('examiner')}
                                >
                                    <div className="flex items-center gap-1">
                                        Examiner
                                        {sortColumn === 'examiner' && (
                                            sortDirection === 'asc' 
                                                ? <ChevronUp className="h-4 w-4" />
                                                : <ChevronDown className="h-4 w-4" />
                                        )}
                                    </div>
                                </th>
                                <th 
                                    className="px-4 py-3 text-left font-semibold"
                                    style={{ color: 'var(--slds-g-color-text-default)' }}
                                >
                                    Total Number of ACEs
                                </th>
                                <th 
                                    className="px-4 py-3 text-right font-semibold"
                                    style={{ color: 'var(--slds-g-color-text-default)' }}
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedRecords.map((record) => (
                                <tr 
                                    key={record.id}
                                    className="hover:bg-gray-50"
                                    style={{ 
                                        borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: hoveredRowId === record.id ? 'var(--slds-g-color-neutral-95)' : 'transparent'
                                    }}
                                    onMouseEnter={() => setHoveredRowId(record.id)}
                                    onMouseLeave={() => setHoveredRowId(null)}
                                >
                                    <td 
                                        className="px-4 py-3 cursor-pointer text-[#0176d3] hover:underline"
                                        onClick={() => handleViewDetails(record)}
                                    >
                                        {formatDateUTC(record.date)}
                                    </td>
                                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        {record.test}
                                    </td>
                                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        {record.examiner || '--'}
                                    </td>
                                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        {record.totalAces}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(record)}
                                                className="p-1 rounded hover:bg-gray-200"
                                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(record.id)}
                                                className="p-1 rounded hover:bg-gray-200"
                                                style={{ color: '#c23934' }}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create/Edit Dialog */}
            <ACEsAssessmentDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSave={handleSave}
                editingData={editingRecord}
                youthName="Marcus Johnson"
            />

            {/* View Dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent 
                    className="sm:max-w-3xl max-h-[90vh] overflow-y-auto" 
                    style={{ 
                        backgroundColor: 'var(--slds-g-color-background-base)', 
                        border: '1px solid var(--slds-g-color-border-base-1)' 
                    }} 
                    aria-describedby={undefined}
                >
                    <DialogHeader>
                        <DialogTitle 
                            className="text-[16px] font-semibold" 
                            style={{ color: 'var(--slds-g-color-text-default)' }}
                        >
                            ACEs Assessment Details
                        </DialogTitle>
                    </DialogHeader>
                    
                    {viewingRecord && (
                        <div className="space-y-6 py-4">
                            {/* Header Information */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>DATE</p>
                                    <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        {formatDateUTC(viewingRecord.date)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>TEST</p>
                                    <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        {viewingRecord.test}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>RATER TYPE</p>
                                    <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        {viewingRecord.raterType}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>RATER</p>
                                    <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        {viewingRecord.rater}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>EXAMINER</p>
                                <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    {viewingRecord.examiner || '--'}
                                </p>
                            </div>

                            {/* Questions */}
                            <div 
                                className="border-t pt-4"
                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                            >
                                <h4 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                    Assessment Responses
                                </h4>
                                <div className="space-y-3">
                                    {viewingRecord.questions.map((q, index) => (
                                        <div 
                                            key={q.id}
                                            className="p-3 rounded"
                                            style={{ 
                                                backgroundColor: 'var(--slds-g-color-neutral-95)',
                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                            }}
                                        >
                                            <p className="text-[13px] mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                {index + 1}. {q.question}
                                            </p>
                                            <p 
                                                className="text-[13px] font-semibold"
                                                style={{ 
                                                    color: q.answer === "Yes" ? '#145F33' : 
                                                           q.answer === "No" ? '#c23934' : 
                                                           'var(--slds-g-color-text-weak)'
                                                }}
                                            >
                                                {q.answer || '--None--'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div 
                                className="border-t pt-4"
                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                            >
                                <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                    TOTAL NUMBER OF ACEs
                                </p>
                                <p 
                                    className="text-[20px] font-semibold"
                                    style={{ color: '#145F33' }}
                                >
                                    {viewingRecord.totalAces}
                                </p>
                            </div>

                            {/* Comments */}
                            {viewingRecord.comments && (
                                <div>
                                    <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--slds-g-color-text-weak)' }}>COMMENTS</p>
                                    <p className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        {viewingRecord.comments}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            onClick={() => setViewDialogOpen(false)}
                            className="h-9 px-6 rounded-full text-[13px]"
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent 
                    className="sm:max-w-md" 
                    style={{ 
                        backgroundColor: 'var(--slds-g-color-background-base)', 
                        border: '1px solid var(--slds-g-color-border-base-1)' 
                    }} 
                    aria-describedby="delete-description"
                >
                    <DialogHeader>
                        <DialogTitle 
                            className="text-[16px] font-semibold" 
                            style={{ color: 'var(--slds-g-color-text-default)' }}
                        >
                            Delete ACEs Record
                        </DialogTitle>
                        <DialogDescription id="delete-description" className="text-[13px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            Are you sure you want to delete this ACEs assessment record? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmOpen(false)}
                            className="h-9 px-6 rounded-full text-[13px] shadow-none"
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            className="h-9 px-6 rounded-full text-[13px]"
                            style={{ 
                                backgroundColor: '#c23934', 
                                color: 'white'
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
