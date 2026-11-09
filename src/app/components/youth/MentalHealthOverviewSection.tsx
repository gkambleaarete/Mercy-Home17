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

export function MentalHealthOverviewSection() {
    // Diagnoses State
    const [diagnoses, setDiagnoses] = useState([
        {
            id: "DX-001",
            startDate: "2023-03-15",
            dsmVersion: "DSM-5",
            code: "314.01",
            details: "Attention-Deficit/Hyperactivity Disorder, Combined Presentation",
            endDate: ""
        },
        {
            id: "DX-002",
            startDate: "2023-03-15",
            dsmVersion: "DSM-5",
            code: "309.81",
            details: "Posttraumatic Stress Disorder",
            endDate: ""
        },
        {
            id: "DX-003",
            startDate: "2022-11-10",
            dsmVersion: "DSM-5",
            code: "296.32",
            details: "Major Depressive Disorder, Recurrent Episode, Moderate",
            endDate: "2023-08-20"
        }
    ]);

    // Mental Health Professionals State
    const [professionals, setProfessionals] = useState([
        {
            id: "MHP-001",
            type: "Psychiatrist",
            name: "Dr. James Taylor",
            phone: "(312) 555-0198",
            address: "450 N. Michigan Ave, Suite 300, Chicago, IL 60611"
        },
        {
            id: "MHP-002",
            type: "Therapist",
            name: "Sarah Martinez, LCSW",
            phone: "(312) 555-0142",
            address: "2800 W. Fullerton Ave, Chicago, IL 60647"
        },
        {
            id: "MHP-003",
            type: "Case Manager",
            name: "Lisa Anderson, MSW",
            phone: "(312) 555-0176",
            address: "Mercy Home for Boys & Girls, 1140 W. Jackson Blvd, Chicago, IL 60607"
        }
    ]);

    const [showDiagnosisDialog, setShowDiagnosisDialog] = useState(false);
    const [showProfessionalDialog, setShowProfessionalDialog] = useState(false);
    const [editingDiagnosisId, setEditingDiagnosisId] = useState<string | null>(null);
    const [editingProfessionalId, setEditingProfessionalId] = useState<string | null>(null);

    const [diagnosisForm, setDiagnosisForm] = useState({
        startDate: "",
        dsmVersion: "",
        code: "",
        details: "",
        endDate: ""
    });

    const [professionalForm, setProfessionalForm] = useState({
        type: "",
        name: "",
        phone: "",
        address: ""
    });

    // Diagnosis Handlers
    const handleAddDiagnosis = () => {
        setEditingDiagnosisId(null);
        setDiagnosisForm({
            startDate: "",
            dsmVersion: "",
            code: "",
            details: "",
            endDate: ""
        });
        setShowDiagnosisDialog(true);
    };

    const handleEditDiagnosis = (diagnosis: any) => {
        setEditingDiagnosisId(diagnosis.id);
        setDiagnosisForm({
            startDate: diagnosis.startDate,
            dsmVersion: diagnosis.dsmVersion,
            code: diagnosis.code,
            details: diagnosis.details,
            endDate: diagnosis.endDate
        });
        setShowDiagnosisDialog(true);
    };

    const handleSaveDiagnosis = () => {
        if (editingDiagnosisId) {
            setDiagnoses(diagnoses.map(d => 
                d.id === editingDiagnosisId 
                    ? { ...d, ...diagnosisForm }
                    : d
            ));
        } else {
            const newDiagnosis = {
                id: `DX-${String(diagnoses.length + 1).padStart(3, '0')}`,
                ...diagnosisForm
            };
            setDiagnoses([...diagnoses, newDiagnosis]);
        }
        setShowDiagnosisDialog(false);
    };

    // Professional Handlers
    const handleAddProfessional = () => {
        setEditingProfessionalId(null);
        setProfessionalForm({
            type: "",
            name: "",
            phone: "",
            address: ""
        });
        setShowProfessionalDialog(true);
    };

    const handleEditProfessional = (professional: any) => {
        setEditingProfessionalId(professional.id);
        setProfessionalForm({
            type: professional.type,
            name: professional.name,
            phone: professional.phone,
            address: professional.address
        });
        setShowProfessionalDialog(true);
    };

    const handleSaveProfessional = () => {
        if (editingProfessionalId) {
            setProfessionals(professionals.map(p => 
                p.id === editingProfessionalId 
                    ? { ...p, ...professionalForm }
                    : p
            ));
        } else {
            const newProfessional = {
                id: `MHP-${String(professionals.length + 1).padStart(3, '0')}`,
                ...professionalForm
            };
            setProfessionals([...professionals, newProfessional]);
        }
        setShowProfessionalDialog(false);
    };

    return (
        <div className="py-6 max-w-6xl space-y-6">
            {/* Diagnoses Section */}
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
                    <h3 className="text-[13px] font-semibold text-[#080707]">Diagnoses</h3>
                    <Button
                        onClick={handleAddDiagnosis}
                        className="h-7 px-3 rounded-full text-[11px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Diagnosis
                    </Button>
                </div>
                <div className="p-4">
                    {diagnoses.length === 0 ? (
                        <div className="text-center py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                            <p className="text-[13px]">No diagnoses recorded</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Start Date</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>DSM Version</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Code</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Details</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>End Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {diagnoses.map((diagnosis, index) => (
                                        <TableRow 
                                            key={diagnosis.id}
                                            style={{ 
                                                borderBottom: index < diagnoses.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                backgroundColor: 'var(--slds-g-color-background-base)'
                                            }}
                                        >
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">
                                                {formatMdy(new Date(diagnosis.startDate))}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{diagnosis.dsmVersion}</TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] font-medium">{diagnosis.code}</TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{diagnosis.details}</TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">
                                                {diagnosis.endDate ? formatMdy(new Date(diagnosis.endDate)) : '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            {/* Mental Health Professionals Section */}
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
                    <h3 className="text-[13px] font-semibold text-[#080707]">Mental Health Professionals</h3>
                    <Button
                        onClick={handleAddProfessional}
                        className="h-7 px-3 rounded-full text-[11px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Professional
                    </Button>
                </div>
                <div className="p-4">
                    {professionals.length === 0 ? (
                        <div className="text-center py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                            <p className="text-[13px]">No mental health professionals recorded</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Type</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Name</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Phone</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Address</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {professionals.map((professional, index) => (
                                        <TableRow 
                                            key={professional.id}
                                            style={{ 
                                                borderBottom: index < professionals.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                backgroundColor: 'var(--slds-g-color-background-base)'
                                            }}
                                        >
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] font-medium">{professional.type}</TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{professional.name}</TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{professional.phone}</TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{professional.address}</TableCell>
                                            <TableCell className="px-3 py-3">
                                                <Button
                                                    onClick={() => handleEditProfessional(professional)}
                                                    variant="ghost"
                                                    className="h-6 px-2 rounded-full text-[11px]"
                                                >
                                                    Modify
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            {/* Diagnosis Dialog */}
            <Dialog open={showDiagnosisDialog} onOpenChange={setShowDiagnosisDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[18px] font-semibold">
                            {editingDiagnosisId ? "Edit Diagnosis" : "Add Diagnosis"}
                        </DialogTitle>
                        <DialogDescription className="text-[14px] text-[#525252]">
                            {editingDiagnosisId ? "Update diagnosis information" : "Add new diagnosis record"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="startDate" className="text-[11px] font-semibold text-[#080707]">Start Date *</Label>
                                <DateInput
                                    id="startDate"
value={isoToMdy(diagnosisForm.startDate)}
                                    onChange={(v) => ((e) => setDiagnosisForm({...diagnosisForm, startDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                    className="mt-1 h-8 text-[13px]"
                                />
                            </div>
                            <div>
                                <Label htmlFor="dsmVersion" className="text-[11px] font-semibold text-[#080707]">DSM Version *</Label>
                                <Select
                                    value={diagnosisForm.dsmVersion}
                                    onValueChange={(value) => setDiagnosisForm({...diagnosisForm, dsmVersion: value})}
                                >
                                    <SelectTrigger className="mt-1 h-8 text-[13px]">
                                        <SelectValue placeholder="Select DSM Version" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DSM-5">DSM-5</SelectItem>
                                        <SelectItem value="DSM-5-TR">DSM-5-TR</SelectItem>
                                        <SelectItem value="DSM-IV-TR">DSM-IV-TR</SelectItem>
                                        <SelectItem value="ICD-10">ICD-10</SelectItem>
                                        <SelectItem value="ICD-11">ICD-11</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="code" className="text-[11px] font-semibold text-[#080707]">Code *</Label>
                            <Input
                                id="code"
                                value={diagnosisForm.code}
                                onChange={(e) => setDiagnosisForm({...diagnosisForm, code: e.target.value})}
                                className="mt-1 h-8 text-[13px]"
                                placeholder="e.g., 314.01"
                            />
                        </div>
                        <div>
                            <Label htmlFor="details" className="text-[11px] font-semibold text-[#080707]">Details *</Label>
                            <Textarea
                                id="details"
                                value={diagnosisForm.details}
                                onChange={(e) => setDiagnosisForm({...diagnosisForm, details: e.target.value})}
                                className="mt-1 min-h-[60px] text-[13px]"
                                placeholder="Diagnosis details..."
                            />
                        </div>
                        <div>
                            <Label htmlFor="endDate" className="text-[11px] font-semibold text-[#080707]">End Date</Label>
                            <DateInput
                                id="endDate"
value={isoToMdy(diagnosisForm.endDate)}
                                onChange={(v) => ((e) => setDiagnosisForm({...diagnosisForm, endDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                className="mt-1 h-8 text-[13px]"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <Button
                            onClick={() => setShowDiagnosisDialog(false)}
                            variant="outline"
                            className="h-8 px-4 rounded-full text-[12px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveDiagnosis}
                            className="h-8 px-4 rounded-full text-[12px] bg-[#145F33] hover:bg-[#0f4a26] text-white"
                            disabled={!diagnosisForm.startDate || !diagnosisForm.dsmVersion || !diagnosisForm.code || !diagnosisForm.details}
                        >
                            {editingDiagnosisId ? "Update" : "Create"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Professional Dialog */}
            <Dialog open={showProfessionalDialog} onOpenChange={setShowProfessionalDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[18px] font-semibold">
                            {editingProfessionalId ? "Edit Mental Health Professional" : "Add Mental Health Professional"}
                        </DialogTitle>
                        <DialogDescription className="text-[14px] text-[#525252]">
                            {editingProfessionalId ? "Update professional information" : "Add new mental health professional"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label htmlFor="type" className="text-[11px] font-semibold text-[#080707]">Type *</Label>
                            <Select
                                value={professionalForm.type}
                                onValueChange={(value) => setProfessionalForm({...professionalForm, type: value})}
                            >
                                <SelectTrigger className="mt-1 h-8 text-[13px]">
                                    <SelectValue placeholder="Select Professional Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                                    <SelectItem value="Psychologist">Psychologist</SelectItem>
                                    <SelectItem value="Therapist">Therapist</SelectItem>
                                    <SelectItem value="Counselor">Counselor</SelectItem>
                                    <SelectItem value="Case Manager">Case Manager</SelectItem>
                                    <SelectItem value="Social Worker">Social Worker</SelectItem>
                                    <SelectItem value="Nurse Practitioner">Nurse Practitioner</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="name" className="text-[11px] font-semibold text-[#080707]">Name *</Label>
                            <Input
                                id="name"
                                value={professionalForm.name}
                                onChange={(e) => setProfessionalForm({...professionalForm, name: e.target.value})}
                                className="mt-1 h-8 text-[13px]"
                                placeholder="Full name with credentials"
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone" className="text-[11px] font-semibold text-[#080707]">Phone *</Label>
                            <Input
                                id="phone"
                                value={professionalForm.phone}
                                onChange={(e) => setProfessionalForm({...professionalForm, phone: e.target.value})}
                                className="mt-1 h-8 text-[13px]"
                                placeholder="(###) ###-####"
                            />
                        </div>
                        <div>
                            <Label htmlFor="address" className="text-[11px] font-semibold text-[#080707]">Address *</Label>
                            <Textarea
                                id="address"
                                value={professionalForm.address}
                                onChange={(e) => setProfessionalForm({...professionalForm, address: e.target.value})}
                                className="mt-1 min-h-[60px] text-[13px]"
                                placeholder="Full address..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <Button
                            onClick={() => setShowProfessionalDialog(false)}
                            variant="outline"
                            className="h-8 px-4 rounded-full text-[12px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveProfessional}
                            className="h-8 px-4 rounded-full text-[12px] bg-[#145F33] hover:bg-[#0f4a26] text-white"
                            disabled={!professionalForm.type || !professionalForm.name || !professionalForm.phone || !professionalForm.address}
                        >
                            {editingProfessionalId ? "Update" : "Create"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}