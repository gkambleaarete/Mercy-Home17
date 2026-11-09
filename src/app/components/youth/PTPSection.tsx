import { useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Plus, AlertTriangle, ChevronRight, ChevronDown, Trash2, Edit2, X, Target, CheckCircle2 } from "@/app/lib/lucide-icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy, localTodayIso } from "../../lib/dateFormat";

interface RelatedEvent {
    id: number;
    date: string;
    comment: string;
    createdBy: string;
}

interface Goal {
    id: number;
    description: string;
    completed: boolean;
    status: string;
}

interface PTPStatement {
    id: number;
    statement: string;
    outcomeDomains: string[];
    startDate: string;
    endDate: string;
    goalsCompleted: string;
    totalGoals: number;
    completedGoals: number;
    status: string;
    // Additional detail view fields
    relatedGoals?: string[];
    goals?: Goal[];
    notes?: string;
    assignedTo?: string;
    lastReviewed?: string;
    relatedEvents?: RelatedEvent[];
}

export function PTPSection() {
    const [statements, setStatements] = useState<PTPStatement[]>([
        {
            id: 1,
            statement: "They secured enough money to afford their future rent, groceries and other living expenses for at least 6 months",
            outcomeDomains: ["Self-Sufficiency & Finances"],
            startDate: "2025-05-01",
            endDate: "",
            goalsCompleted: "1/4",
            totalGoals: 4,
            completedGoals: 1,
            status: "In Progress",
            relatedGoals: ["Obtain employment", "Create budget plan", "Open savings account", "Learn financial literacy"],
            goals: [
                { id: 1, description: "Obtain employment", completed: true, status: "Completed" },
                { id: 2, description: "Create budget plan", completed: false, status: "In Progress" },
                { id: 3, description: "Open savings account", completed: false, status: "Not Started" },
                { id: 4, description: "Learn financial literacy", completed: false, status: "In Progress" }
            ],
            notes: "Youth is making steady progress on financial independence goals",
            assignedTo: "Sarah Johnson",
            lastReviewed: "2025-01-10"
        },
        {
            id: 2,
            statement: "They are able to function emotionally and handle stressful situations using healthy coping strategies",
            outcomeDomains: ["Socio-Emotional Wellness"],
            startDate: "2025-05-01",
            endDate: "",
            goalsCompleted: "0/1",
            totalGoals: 1,
            completedGoals: 0,
            status: "In Progress",
            relatedGoals: ["Attend weekly therapy sessions"],
            goals: [
                { id: 1, description: "Attend weekly therapy sessions", completed: false, status: "In Progress" }
            ],
            notes: "Youth is actively participating in therapy",
            assignedTo: "David Martinez",
            lastReviewed: "2025-01-08"
        },
        {
            id: 3,
            statement: "When they receive their first college grades, they will successfully pass all of their courses",
            outcomeDomains: ["Education & Vocation"],
            startDate: "2025-05-01",
            endDate: "",
            goalsCompleted: "1/1",
            totalGoals: 1,
            completedGoals: 1,
            status: "In Progress",
            relatedGoals: ["Enroll in college courses"],
            goals: [
                { id: 1, description: "Enroll in college courses", completed: true, status: "Completed" }
            ],
            notes: "Youth has been accepted and enrolled in community college",
            assignedTo: "Jennifer Lee",
            lastReviewed: "2025-01-12"
        }
    ]);

    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [showStatementDialog, setShowStatementDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [selectedStatement, setSelectedStatement] = useState<PTPStatement | null>(null);
    const [editingStatementId, setEditingStatementId] = useState<number | null>(null);
    const [showDomainSelector, setShowDomainSelector] = useState(false);
    const [statementForm, setStatementForm] = useState({
        statement: "",
        outcomeDomains: [] as string[],
        startDate: "",
        endDate: "",
        totalGoals: 1,
        completedGoals: 0,
        status: "In Progress",
        relatedGoals: "",
        goals: [] as Goal[],
        notes: "",
        assignedTo: ""
    });

    const outcomeDomainOptions = [
        "Self-Sufficiency & Finances",
        "Socio-Emotional Wellness",
        "Education & Vocation",
        "Health & Well-Being",
        "Housing & Living Skills",
        "Social Connections & Support",
        "Career Development",
        "Life Skills"
    ];

    const toggleRowExpansion = (id: number) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const handleAddStatement = () => {
        setEditingStatementId(null);
        setStatementForm({
            statement: "",
            outcomeDomains: [],
            startDate: "",
            endDate: "",
            totalGoals: 1,
            completedGoals: 0,
            status: "In Progress",
            relatedGoals: "",
            goals: [],
            notes: "",
            assignedTo: ""
        });
        setShowDomainSelector(false);
        setShowStatementDialog(true);
    };

    const handleSaveStatement = () => {
        const completedCount = statementForm.goals.filter(g => g.completed).length;
        const goalsCompleted = `${completedCount}/${statementForm.goals.length}`;
        
        if (editingStatementId) {
            setStatements(statements.map(s => 
                s.id === editingStatementId 
                    ? { 
                        ...s, 
                        ...statementForm,
                        goalsCompleted,
                        totalGoals: statementForm.goals.length,
                        completedGoals: completedCount,
                        relatedGoals: statementForm.relatedGoals ? statementForm.relatedGoals.split('\n').filter(g => g.trim()) : [],
                        goals: statementForm.goals
                    }
                    : s
            ));
        } else {
            const newStatement: PTPStatement = {
                id: Math.max(...statements.map(s => s.id), 0) + 1,
                statement: statementForm.statement,
                outcomeDomains: statementForm.outcomeDomains,
                startDate: statementForm.startDate,
                endDate: statementForm.endDate,
                goalsCompleted,
                totalGoals: statementForm.goals.length,
                completedGoals: completedCount,
                status: statementForm.status,
                relatedGoals: statementForm.relatedGoals ? statementForm.relatedGoals.split('\n').filter(g => g.trim()) : [],
                goals: statementForm.goals,
                notes: statementForm.notes,
                assignedTo: statementForm.assignedTo,
                lastReviewed: localTodayIso()
            };
            setStatements([...statements, newStatement]);
        }
    };

    const handleRowClick = (statement: PTPStatement) => {
        setSelectedStatement(statement);
        setShowDetailDialog(true);
    };

    const toggleDomainSelection = (domain: string) => {
        const newDomains = statementForm.outcomeDomains.includes(domain)
            ? statementForm.outcomeDomains.filter(d => d !== domain)
            : [...statementForm.outcomeDomains, domain];
        setStatementForm({ ...statementForm, outcomeDomains: newDomains });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Completed": return "#2E844A";
            case "In Progress": return "#0176D3";
            case "Not Started": return "#706E6B";
            case "On Hold": return "#FE9339";
            default: return "#706E6B";
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
                    <h3 className="text-[13px] font-semibold text-[#080707]">Positive Transition Plan</h3>
                    <Button
                        onClick={handleAddStatement}
                        className="h-7 px-3 rounded-full text-[11px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Create New Statement
                    </Button>
                </div>
                <div className="p-4">
                    {statements.length === 0 ? (
                        <div className="text-center py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                            <p className="text-[13px]">No transition plan statements created</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Statement
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Outcome Domain(s)
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Start Date
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            End Date
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Goals Completed
                                        </TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                            Status
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {statements.map((statement, index) => {
                                        const isExpanded = expandedRows.has(statement.id);
                                        const shouldTruncate = statement.statement.length > 60;
                                        
                                        return (
                                            <TableRow 
                                                key={statement.id}
                                                onClick={() => handleRowClick(statement)}
                                                className="cursor-pointer hover:bg-gray-50"
                                                style={{ 
                                                    borderBottom: index < statements.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none'
                                                }}
                                            >
                                                <TableCell 
                                                    className="px-3 py-3 text-[13px] text-[#080707] max-w-[400px]"
                                                    onClick={(e) => {
                                                        if (shouldTruncate) {
                                                            e.stopPropagation();
                                                            toggleRowExpansion(statement.id);
                                                        }
                                                    }}
                                                >
                                                    <div className={isExpanded ? "" : "line-clamp-2"}>
                                                        {statement.statement}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-[13px] text-[#080707]">
                                                    <div className="flex flex-wrap gap-1">
                                                        {statement.outcomeDomains.map((domain, idx) => (
                                                            <span 
                                                                key={idx}
                                                                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium"
                                                                style={{ 
                                                                    backgroundColor: '#E8F4F0',
                                                                    color: '#145F33'
                                                                }}
                                                            >
                                                                {domain}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                    {formatMdy(new Date(statement.startDate))}
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                    {statement.endDate ? formatMdy(new Date(statement.endDate)) : '—'}
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-[13px] text-[#080707] text-center">
                                                    {statement.goalsCompleted}
                                                </TableCell>
                                                <TableCell className="px-3 py-3 text-[13px]">
                                                    <span 
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium"
                                                        style={{ 
                                                            backgroundColor: getStatusColor(statement.status) + '15',
                                                            color: getStatusColor(statement.status)
                                                        }}
                                                    >
                                                        {statement.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Detail View Dialog */}
                    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
                                    PTP Statement Details
                                </DialogTitle>
                                <DialogDescription>
                                    View complete information about this positive transition plan statement.
                                </DialogDescription>
                            </DialogHeader>
                            {selectedStatement && (
                                <div className="space-y-5 py-4">
                                    {/* Statement Information */}
                                    <div 
                                        className="rounded-lg p-4"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: '#f9fafb'
                                        }}
                                    >
                                        <h4 className="font-semibold text-[14px] mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Statement
                                        </h4>
                                        <div className="text-[13px] text-[#080707] leading-relaxed">
                                            {selectedStatement.statement}
                                        </div>
                                    </div>

                                    {/* Outcome Domains */}
                                    <div 
                                        className="rounded-lg p-4"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: '#f0fdf4'
                                        }}
                                    >
                                        <h4 className="font-semibold text-[14px] mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Outcome Domains
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedStatement.outcomeDomains.map((domain, idx) => (
                                                <span 
                                                    key={idx}
                                                    className="inline-flex items-center px-3 py-1.5 rounded text-[12px] font-medium"
                                                    style={{ 
                                                        backgroundColor: '#E8F4F0',
                                                        color: '#145F33'
                                                    }}
                                                >
                                                    {domain}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Timeline & Progress */}
                                    <div 
                                        className="rounded-lg p-4"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: 'var(--slds-g-color-background-base)'
                                        }}
                                    >
                                        <h4 className="font-semibold text-[14px] mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Timeline & Progress
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-[11px] text-gray-600 mb-1">Start Date</div>
                                                <div className="text-[13px] font-semibold">
                                                    {formatMdy(new Date(selectedStatement.startDate))}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] text-gray-600 mb-1">End Date</div>
                                                <div className="text-[13px] font-semibold">
                                                    {selectedStatement.endDate ? formatMdy(new Date(selectedStatement.endDate)) : 'Ongoing'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] text-gray-600 mb-1">Goals Completed</div>
                                                <div className="text-[13px] font-semibold">{selectedStatement.goalsCompleted}</div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] text-gray-600 mb-1">Status</div>
                                                <div className="mt-1">
                                                    <span 
                                                        className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium"
                                                        style={{ 
                                                            backgroundColor: getStatusColor(selectedStatement.status) + '15',
                                                            color: getStatusColor(selectedStatement.status)
                                                        }}
                                                    >
                                                        {selectedStatement.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Related Goals */}
                                    {selectedStatement.relatedGoals && selectedStatement.relatedGoals.length > 0 && (
                                        <div 
                                            className="rounded-lg p-4"
                                            style={{
                                                border: '1px solid var(--slds-g-color-border-base-1)',
                                                backgroundColor: '#eff6ff'
                                            }}
                                        >
                                            <h4 className="font-semibold text-[14px] mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                Related Goals
                                            </h4>
                                            <ul className="space-y-2">
                                                {selectedStatement.relatedGoals.map((goal, idx) => (
                                                    <li key={idx} className="text-[13px] text-[#080707] flex items-start gap-2">
                                                        <span className="text-[#145F33] mt-1">•</span>
                                                        <span>{goal}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Additional Information */}
                                    <div 
                                        className="rounded-lg p-4"
                                        style={{
                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                            backgroundColor: 'var(--slds-g-color-background-base)'
                                        }}
                                    >
                                        <h4 className="font-semibold text-[14px] mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Additional Information
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <div className="text-[11px] text-gray-600 mb-1">Assigned To</div>
                                                <div className="text-[13px] font-semibold">{selectedStatement.assignedTo || '—'}</div>
                                            </div>
                                            <div>
                                                <div className="text-[11px] text-gray-600 mb-1">Last Reviewed</div>
                                                <div className="text-[13px] font-semibold">
                                                    {selectedStatement.lastReviewed ? formatMdy(new Date(selectedStatement.lastReviewed)) : '—'}
                                                </div>
                                            </div>
                                        </div>
                                        {selectedStatement.notes && (
                                            <div>
                                                <div className="text-[11px] text-gray-600 mb-1">Notes</div>
                                                <div className="text-[13px] text-[#080707]">{selectedStatement.notes}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button 
                                    onClick={() => setShowDetailDialog(false)}
                                    className="rounded-full px-6"
                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                >
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Add/Edit Statement Dialog */}
                    <Dialog open={showStatementDialog} onOpenChange={setShowStatementDialog}>
                        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Edit2 className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
                                    {editingStatementId ? 'Edit PTP Statement' : 'Create New PTP Statement'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingStatementId ? 'Update the positive transition plan statement and associated goals.' : 'Define a new positive transition plan statement with measurable goals.'}
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-5 py-4">
                                {/* Statement Section */}
                                <div 
                                    className="rounded-lg p-4"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                    }}
                                >
                                    <h4 className="font-semibold text-[14px] mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Statement Details
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="statement" className="text-[12px] font-semibold mb-1.5 block">
                                                Statement <span className="text-red-600">*</span>
                                            </Label>
                                            <Textarea
                                                id="statement"
                                                value={statementForm.statement}
                                                onChange={(e) => setStatementForm({...statementForm, statement: e.target.value})}
                                                className="min-h-[100px] text-[13px]"
                                                placeholder="Enter the PTP statement..."
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-[12px] font-semibold mb-1.5 block">
                                                Outcome Domain(s) <span className="text-red-600">*</span>
                                            </Label>
                                            {statementForm.outcomeDomains.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {statementForm.outcomeDomains.map((domain, idx) => (
                                                        <span 
                                                            key={idx}
                                                            className="inline-flex items-center px-2 py-1 rounded text-[11px] font-medium"
                                                            style={{ 
                                                                backgroundColor: '#E8F4F0',
                                                                color: '#145F33'
                                                            }}
                                                        >
                                                            {domain}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {!showDomainSelector ? (
                                                <Button
                                                    onClick={() => setShowDomainSelector(true)}
                                                    variant="outline"
                                                    className="h-8 text-[12px]"
                                                >
                                                    {statementForm.outcomeDomains.length > 0 ? 'Modify Domains' : '+ Add Outcome Domain'}
                                                </Button>
                                            ) : (
                                                <div 
                                                    className="p-4 rounded-lg space-y-3" 
                                                    style={{ 
                                                        backgroundColor: '#f9fafb', 
                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Label className="text-[12px] font-semibold">Select Domains</Label>
                                                        <Button
                                                            onClick={() => setShowDomainSelector(false)}
                                                            variant="ghost"
                                                            className="h-6 w-6 p-0"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {outcomeDomainOptions.map((domain) => (
                                                            <div key={domain} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`domain-${domain}`}
                                                                    checked={statementForm.outcomeDomains.includes(domain)}
                                                                    onCheckedChange={() => toggleDomainSelection(domain)}
                                                                />
                                                                <Label htmlFor={`domain-${domain}`} className="text-[12px] cursor-pointer">
                                                                    {domain}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline Section */}
                                <div 
                                    className="rounded-lg p-4"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: '#f9fafb'
                                    }}
                                >
                                    <h4 className="font-semibold text-[14px] mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Timeline
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="startDate" className="text-[12px] font-semibold mb-1.5 block">
                                                Start Date <span className="text-red-600">*</span>
                                            </Label>
                                            <DateInput
                                                id="startDate"
value={isoToMdy(statementForm.startDate)}
                                                onChange={(v) => ((e) => setStatementForm({...statementForm, startDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                className="h-9 text-[13px]"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="endDate" className="text-[12px] font-semibold mb-1.5 block">
                                                End Date
                                            </Label>
                                            <DateInput
                                                id="endDate"
value={isoToMdy(statementForm.endDate)}
                                                onChange={(v) => ((e) => setStatementForm({...statementForm, endDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                className="h-9 text-[13px]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Assignment & Notes Section */}
                                <div 
                                    className="rounded-lg p-4"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                    }}
                                >
                                    <h4 className="font-semibold text-[14px] mb-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                        Assignment & Notes
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="assignedTo" className="text-[12px] font-semibold mb-1.5 block">
                                                Assigned To
                                            </Label>
                                            <Select
                                                value={statementForm.assignedTo}
                                                onValueChange={(value) => setStatementForm({...statementForm, assignedTo: value})}
                                            >
                                                <SelectTrigger id="assignedTo" className="h-9 text-[13px]">
                                                    <SelectValue placeholder="Select staff member" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                                                    <SelectItem value="David Martinez">David Martinez</SelectItem>
                                                    <SelectItem value="Jennifer Lee">Jennifer Lee</SelectItem>
                                                    <SelectItem value="Robert Wilson">Robert Wilson</SelectItem>
                                                    <SelectItem value="Amanda Foster">Amanda Foster</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor="notes" className="text-[12px] font-semibold mb-1.5 block">
                                                Notes
                                            </Label>
                                            <Textarea
                                                id="notes"
                                                value={statementForm.notes}
                                                onChange={(e) => setStatementForm({...statementForm, notes: e.target.value})}
                                                className="min-h-[80px] text-[13px]"
                                                placeholder="Additional notes or observations..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Goals Section */}
                                <div 
                                    className="rounded-lg overflow-hidden"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                    }}
                                >
                                    <div 
                                        className="px-4 py-3 flex items-center justify-between"
                                        style={{ 
                                            backgroundColor: '#fafafa',
                                            borderBottom: '1px solid var(--slds-g-color-border-base-1)'
                                        }}
                                    >
                                        <h4 className="font-semibold text-[14px]" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                            Goals ({statementForm.goals.length})
                                        </h4>
                                        <Button
                                            onClick={() => {
                                                const newGoal: Goal = {
                                                    id: Math.max(...statementForm.goals.map(g => g.id), 0) + 1,
                                                    description: "",
                                                    completed: false,
                                                    status: "Not Started"
                                                };
                                                setStatementForm({ ...statementForm, goals: [...statementForm.goals, newGoal] });
                                            }}
                                            className="h-7 px-3 rounded-full text-[11px] font-medium"
                                            style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                        >
                                            <Plus className="h-3 w-3 mr-1" />
                                            Add Goal
                                        </Button>
                                    </div>
                                    <div className="p-4">
                                        {statementForm.goals.length === 0 ? (
                                            <div className="text-center py-8 text-[12px] text-gray-500">
                                                No goals added yet. Click "Add Goal" to get started.
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {statementForm.goals.map((goal) => (
                                                    <div 
                                                        key={goal.id}
                                                        className="p-4 rounded-lg"
                                                        style={{ 
                                                            border: '1px solid var(--slds-g-color-border-base-1)',
                                                            backgroundColor: '#fafafa'
                                                        }}
                                                    >
                                                        <div className="space-y-3">
                                                            <div>
                                                                <Label className="text-[11px] font-semibold mb-1.5 block" style={{ color: '#706e6b' }}>
                                                                    Goal Description
                                                                </Label>
                                                                <Input
                                                                    value={goal.description}
                                                                    onChange={(e) => {
                                                                        const updatedGoals = statementForm.goals.map(g =>
                                                                            g.id === goal.id ? { ...g, description: e.target.value } : g
                                                                        );
                                                                        setStatementForm({ ...statementForm, goals: updatedGoals });
                                                                    }}
                                                                    className="h-9 text-[13px]"
                                                                    placeholder="Enter goal description..."
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div>
                                                                    <Label className="text-[11px] font-semibold mb-1.5 block" style={{ color: '#706e6b' }}>
                                                                        Status
                                                                    </Label>
                                                                    <Select
                                                                        value={goal.status}
                                                                        onValueChange={(value) => {
                                                                            const updatedGoals = statementForm.goals.map(g =>
                                                                                g.id === goal.id ? { ...g, status: value, completed: value === "Completed" } : g
                                                                            );
                                                                            setStatementForm({ ...statementForm, goals: updatedGoals });
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="h-9 text-[13px]">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="Not Started">Not Started</SelectItem>
                                                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                                                            <SelectItem value="Completed">Completed</SelectItem>
                                                                            <SelectItem value="On Hold">On Hold</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="flex items-end">
                                                                    <div className="flex items-center space-x-2">
                                                                        <Checkbox
                                                                            id={`goal-completed-${goal.id}`}
                                                                            checked={goal.completed}
                                                                            onCheckedChange={(checked) => {
                                                                                const updatedGoals = statementForm.goals.map(g =>
                                                                                    g.id === goal.id ? { ...g, completed: !!checked, status: checked ? "Completed" : "In Progress" } : g
                                                                                );
                                                                                setStatementForm({ ...statementForm, goals: updatedGoals });
                                                                            }}
                                                                        />
                                                                        <Label htmlFor={`goal-completed-${goal.id}`} className="text-[12px] cursor-pointer">
                                                                            Mark as Completed
                                                                        </Label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-end pt-2" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                <Button
                                                                    onClick={() => {
                                                                        const updatedGoals = statementForm.goals.filter(g => g.id !== goal.id);
                                                                        setStatementForm({ ...statementForm, goals: updatedGoals });
                                                                    }}
                                                                    variant="ghost"
                                                                    className="h-7 px-3 text-[11px] text-red-600 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                                    Remove Goal
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {statementForm.goals.length > 0 && (
                                            <div className="mt-3 pt-3 text-center text-[12px] font-semibold text-gray-600" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                {statementForm.goals.filter(g => g.completed).length} of {statementForm.goals.length} Goals Completed
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowStatementDialog(false)}
                                    className="rounded-full px-6"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={() => {
                                        handleSaveStatement();
                                        setShowStatementDialog(false);
                                    }}
                                    className="rounded-full px-6"
                                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                                    disabled={!statementForm.statement || statementForm.outcomeDomains.length === 0 || !statementForm.startDate}
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Save & Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
