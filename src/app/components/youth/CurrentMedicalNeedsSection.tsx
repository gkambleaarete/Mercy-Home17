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

export function CurrentMedicalNeedsSection() {
    // Medical & Physical Needs State
    const [medicalNeeds, setMedicalNeeds] = useState([
        {
            id: 1,
            type: "Medication Management",
            allergyType: "N/A",
            startDate: "2024-01-15",
            endDate: "",
            details: "Daily medications for ADHD - Adderall XR 20mg taken at 7:00 AM with breakfast. Must be administered by medical staff. Monitor for side effects including decreased appetite and sleep disturbances.",
            createdBy: "Sarah Johnson, RN"
        },
        {
            id: 2,
            type: "Medical Equipment",
            allergyType: "N/A",
            startDate: "2024-03-10",
            endDate: "",
            details: "Requires corrective lenses (prescription -2.50 both eyes). Glasses must be worn during all academic activities and recreational reading. Backup pair stored in medical office.",
            createdBy: "Michael Chen, Program Coordinator"
        },
        {
            id: 3,
            type: "Allergy",
            allergyType: "Environmental",
            startDate: "2023-09-01",
            endDate: "",
            details: "Severe seasonal allergies (ragweed, pollen). Takes Zyrtec 10mg daily during spring and fall. Keep windows closed in room during high pollen count days. Rescue inhaler available if needed.",
            createdBy: "Dr. Patricia Moore"
        }
    ]);

    // Dietary Needs State
    const [dietaryNeeds, setDietaryNeeds] = useState([
        {
            id: 1,
            type: "Food Allergy",
            allergy: "Tree Nuts",
            startDate: "2020-05-15",
            endDate: "",
            details: "Severe tree nut allergy (almonds, walnuts, cashews, pecans). Risk of anaphylaxis. EpiPen must be available at all times. Kitchen staff notified - no cross-contamination allowed. Youth carries medical alert bracelet.",
            createdBy: "Dr. Emily Rodriguez"
        },
        {
            id: 2,
            type: "Dietary Restriction",
            allergy: "N/A",
            startDate: "2024-02-01",
            endDate: "",
            details: "Lactose intolerance - avoid dairy products. Provide lactose-free milk, cheese alternatives, and non-dairy yogurt. May experience digestive discomfort if dairy consumed. Calcium supplementation recommended.",
            createdBy: "Amanda Foster, Dietitian"
        },
        {
            id: 3,
            type: "Medical Diet",
            allergy: "N/A",
            startDate: "2024-06-20",
            endDate: "",
            details: "Low-sugar diet recommended by endocrinologist due to pre-diabetic status. Limit refined carbohydrates and sugary beverages. Emphasize whole grains, lean proteins, vegetables. Monitor blood glucose weekly.",
            createdBy: "Dr. James Taylor"
        }
    ]);

    // Identifying Features State
    const [identifyingFeatures, setIdentifyingFeatures] = useState([
        {
            id: 1,
            dateReported: "2024-01-10",
            type: "Birthmark",
            location: "Left shoulder blade",
            details: "Distinctive port-wine stain birthmark, approximately 3 inches in diameter, dark red/purple coloring. Present since birth. Useful for positive identification.",
            createdBy: "Intake Coordinator"
        },
        {
            id: 2,
            dateReported: "2024-01-10",
            type: "Scar",
            location: "Right knee",
            details: "2-inch vertical surgical scar from ACL reconstruction surgery in 2022. Well-healed but visible. From sports injury during basketball game.",
            createdBy: "Medical Assessment Team"
        },
        {
            id: 3,
            dateReported: "2024-03-15",
            type: "Tattoo",
            location: "Left forearm",
            details: "Small star tattoo (approximately 1 inch) on inner left forearm. States was done at age 15 without parental consent. No plans for removal at this time.",
            createdBy: "Robert Wilson, Case Manager"
        }
    ]);

    // Dialog States
    const [showMedicalDialog, setShowMedicalDialog] = useState(false);
    const [showDietaryDialog, setShowDietaryDialog] = useState(false);
    const [showFeaturesDialog, setShowFeaturesDialog] = useState(false);
    
    const [showMedicalDetail, setShowMedicalDetail] = useState(false);
    const [showDietaryDetail, setShowDietaryDetail] = useState(false);
    const [showFeaturesDetail, setShowFeaturesDetail] = useState(false);
    
    const [selectedMedical, setSelectedMedical] = useState<any>(null);
    const [selectedDietary, setSelectedDietary] = useState<any>(null);
    const [selectedFeature, setSelectedFeature] = useState<any>(null);
    
    const [editingMedicalId, setEditingMedicalId] = useState<number | null>(null);
    const [editingDietaryId, setEditingDietaryId] = useState<number | null>(null);
    const [editingFeatureId, setEditingFeatureId] = useState<number | null>(null);

    // Form States
    const [medicalForm, setMedicalForm] = useState({
        type: "",
        allergyType: "",
        startDate: "",
        endDate: "",
        details: ""
    });

    const [dietaryForm, setDietaryForm] = useState({
        type: "",
        allergy: "",
        startDate: "",
        endDate: "",
        details: ""
    });

    const [featureForm, setFeatureForm] = useState({
        dateReported: "",
        type: "",
        location: "",
        details: ""
    });

    // Medical Needs Handlers
    const handleAddMedical = () => {
        setEditingMedicalId(null);
        setMedicalForm({ type: "", allergyType: "", startDate: "", endDate: "", details: "" });
        setShowMedicalDialog(true);
    };

    const handleEditMedical = (record: any) => {
        setEditingMedicalId(record.id);
        setMedicalForm({
            type: record.type,
            allergyType: record.allergyType || "",
            startDate: record.startDate,
            endDate: record.endDate || "",
            details: record.details
        });
        setShowMedicalDialog(true);
    };

    const handleSaveMedical = () => {
        if (editingMedicalId) {
            setMedicalNeeds(medicalNeeds.map(r => 
                r.id === editingMedicalId ? { ...r, ...medicalForm } : r
            ));
        } else {
            const newRecord = {
                id: Math.max(...medicalNeeds.map(r => r.id), 0) + 1,
                ...medicalForm,
                createdBy: getDemoUserName()
            };
            setMedicalNeeds([...medicalNeeds, newRecord]);
        }
        setShowMedicalDialog(false);
    };

    // Dietary Needs Handlers
    const handleAddDietary = () => {
        setEditingDietaryId(null);
        setDietaryForm({ type: "", allergy: "", startDate: "", endDate: "", details: "" });
        setShowDietaryDialog(true);
    };

    const handleEditDietary = (record: any) => {
        setEditingDietaryId(record.id);
        setDietaryForm({
            type: record.type,
            allergy: record.allergy || "",
            startDate: record.startDate,
            endDate: record.endDate || "",
            details: record.details
        });
        setShowDietaryDialog(true);
    };

    const handleSaveDietary = () => {
        if (editingDietaryId) {
            setDietaryNeeds(dietaryNeeds.map(r => 
                r.id === editingDietaryId ? { ...r, ...dietaryForm } : r
            ));
        } else {
            const newRecord = {
                id: Math.max(...dietaryNeeds.map(r => r.id), 0) + 1,
                ...dietaryForm,
                createdBy: getDemoUserName()
            };
            setDietaryNeeds([...dietaryNeeds, newRecord]);
        }
        setShowDietaryDialog(false);
    };

    // Identifying Features Handlers
    const handleAddFeature = () => {
        setEditingFeatureId(null);
        setFeatureForm({ dateReported: "", type: "", location: "", details: "" });
        setShowFeaturesDialog(true);
    };

    const handleEditFeature = (record: any) => {
        setEditingFeatureId(record.id);
        setFeatureForm({
            dateReported: record.dateReported,
            type: record.type,
            location: record.location,
            details: record.details
        });
        setShowFeaturesDialog(true);
    };

    const handleSaveFeature = () => {
        if (editingFeatureId) {
            setIdentifyingFeatures(identifyingFeatures.map(r => 
                r.id === editingFeatureId ? { ...r, ...featureForm } : r
            ));
        } else {
            const newRecord = {
                id: Math.max(...identifyingFeatures.map(r => r.id), 0) + 1,
                ...featureForm,
                createdBy: getDemoUserName()
            };
            setIdentifyingFeatures([...identifyingFeatures, newRecord]);
        }
        setShowFeaturesDialog(false);
    };

    return (
        <div className="space-y-6">
            {/* Medical & Physical Needs Section */}
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
                    <h3 className="text-[13px] font-semibold text-[#080707]">Medical & Physical Needs</h3>
                    <Button
                        onClick={handleAddMedical}
                        className="h-7 px-3 rounded-full text-[11px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Medical Need
                    </Button>
                </div>
                <div className="p-4">
                    {medicalNeeds.length === 0 ? (
                        <div className="text-center py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                            <p className="text-[13px]">No medical or physical needs recorded</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Type</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Allergy Type</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Start Date</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>End Date</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {medicalNeeds.map((record, index) => (
                                        <TableRow 
                                            key={record.id}
                                            onClick={() => { setSelectedMedical(record); setShowMedicalDetail(true); }}
                                            className="cursor-pointer hover:bg-gray-50"
                                            style={{ 
                                                borderBottom: index < medicalNeeds.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                backgroundColor: 'var(--slds-g-color-background-base)'
                                            }}
                                        >
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{record.type}</TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{record.allergyType || '—'}</TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                {formatMdy(new Date(record.startDate))}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                {record.endDate ? formatMdy(new Date(record.endDate)) : 'Ongoing'}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] max-w-[300px]">
                                                <div className="line-clamp-2">{record.details}</div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            {/* Dietary Needs Section */}
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
                    <h3 className="text-[13px] font-semibold text-[#080707]">Dietary Needs</h3>
                    <Button
                        onClick={handleAddDietary}
                        className="h-7 px-3 rounded-full text-[11px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Dietary Need
                    </Button>
                </div>
                <div className="p-4">
                    {dietaryNeeds.length === 0 ? (
                        <div className="text-center py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                            <p className="text-[13px]">No dietary needs recorded</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Type</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Allergy</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Start Date</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>End Date</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dietaryNeeds.map((record, index) => (
                                        <TableRow 
                                            key={record.id}
                                            onClick={() => { setSelectedDietary(record); setShowDietaryDetail(true); }}
                                            className="cursor-pointer hover:bg-gray-50"
                                            style={{ 
                                                borderBottom: index < dietaryNeeds.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                backgroundColor: 'var(--slds-g-color-background-base)'
                                            }}
                                        >
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{record.type}</TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{record.allergy || '—'}</TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                {formatMdy(new Date(record.startDate))}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                {record.endDate ? formatMdy(new Date(record.endDate)) : 'Ongoing'}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] max-w-[300px]">
                                                <div className="line-clamp-2">{record.details}</div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            {/* Identifying Features Section */}
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
                    <h3 className="text-[13px] font-semibold text-[#080707]">Identifying Features</h3>
                    <Button
                        onClick={handleAddFeature}
                        className="h-7 px-3 rounded-full text-[11px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white"
                    >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Feature
                    </Button>
                </div>
                <div className="p-4">
                    {identifyingFeatures.length === 0 ? (
                        <div className="text-center py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                            <p className="text-[13px]">No identifying features recorded</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Date Reported</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Type</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Location</TableHead>
                                        <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {identifyingFeatures.map((record, index) => (
                                        <TableRow 
                                            key={record.id}
                                            onClick={() => { setSelectedFeature(record); setShowFeaturesDetail(true); }}
                                            className="cursor-pointer hover:bg-gray-50"
                                            style={{ 
                                                borderBottom: index < identifyingFeatures.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                backgroundColor: 'var(--slds-g-color-background-base)'
                                            }}
                                        >
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] whitespace-nowrap">
                                                {formatMdy(new Date(record.dateReported))}
                                            </TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{record.type}</TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{record.location}</TableCell>
                                            <TableCell className="px-3 py-3 text-[13px] text-[#080707] max-w-[300px]">
                                                <div className="line-clamp-2">{record.details}</div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            {/* Medical Needs Detail Dialog */}
            <Dialog open={showMedicalDetail} onOpenChange={setShowMedicalDetail}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[18px] font-semibold">Medical & Physical Need Details</DialogTitle>
                        <DialogDescription className="text-[14px] text-[#525252]">Complete medical need information</DialogDescription>
                    </DialogHeader>
                    {selectedMedical && (
                        <div className="py-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Type</Label>
                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedMedical.type}</div>
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Allergy Type</Label>
                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedMedical.allergyType || '—'}</div>
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Start Date</Label>
                                    <div className="text-[13px] mt-1 text-[#080707]">
                                        {formatMdy(new Date(selectedMedical.startDate))}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">End Date</Label>
                                    <div className="text-[13px] mt-1 text-[#080707]">
                                        {selectedMedical.endDate ? formatMdy(new Date(selectedMedical.endDate)) : 'Ongoing'}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Details</Label>
                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedMedical.details}</div>
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Created By</Label>
                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedMedical.createdBy}</div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                <Button onClick={() => setShowMedicalDetail(false)} variant="outline" className="h-8 px-4 rounded-full text-[12px]">Close</Button>
                                <Button onClick={() => { setShowMedicalDetail(false); handleEditMedical(selectedMedical); }} className="h-8 px-4 rounded-full text-[12px] bg-[#145F33] hover:bg-[#0f4a26] text-white">Edit</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dietary Needs Detail Dialog */}
            <Dialog open={showDietaryDetail} onOpenChange={setShowDietaryDetail}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[18px] font-semibold">Dietary Need Details</DialogTitle>
                        <DialogDescription className="text-[14px] text-[#525252]">Complete dietary need information</DialogDescription>
                    </DialogHeader>
                    {selectedDietary && (
                        <div className="py-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Type</Label>
                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedDietary.type}</div>
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Allergy</Label>
                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedDietary.allergy || '—'}</div>
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Start Date</Label>
                                    <div className="text-[13px] mt-1 text-[#080707]">
                                        {formatMdy(new Date(selectedDietary.startDate))}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">End Date</Label>
                                    <div className="text-[13px] mt-1 text-[#080707]">
                                        {selectedDietary.endDate ? formatMdy(new Date(selectedDietary.endDate)) : 'Ongoing'}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Details</Label>
                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedDietary.details}</div>
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Created By</Label>
                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedDietary.createdBy}</div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                <Button onClick={() => setShowDietaryDetail(false)} variant="outline" className="h-8 px-4 rounded-full text-[12px]">Close</Button>
                                <Button onClick={() => { setShowDietaryDetail(false); handleEditDietary(selectedDietary); }} className="h-8 px-4 rounded-full text-[12px] bg-[#145F33] hover:bg-[#0f4a26] text-white">Edit</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Identifying Features Detail Dialog */}
            <Dialog open={showFeaturesDetail} onOpenChange={setShowFeaturesDetail}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[18px] font-semibold">Identifying Feature Details</DialogTitle>
                        <DialogDescription className="text-[14px] text-[#525252]">Complete identifying feature information</DialogDescription>
                    </DialogHeader>
                    {selectedFeature && (
                        <div className="py-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Date Reported</Label>
                                    <div className="text-[13px] mt-1 text-[#080707]">
                                        {formatMdy(new Date(selectedFeature.dateReported))}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Type</Label>
                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedFeature.type}</div>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Location</Label>
                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedFeature.location}</div>
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Details</Label>
                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedFeature.details}</div>
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Created By</Label>
                                    <div className="text-[13px] mt-1 text-[#080707]">{selectedFeature.createdBy}</div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                <Button onClick={() => setShowFeaturesDetail(false)} variant="outline" className="h-8 px-4 rounded-full text-[12px]">Close</Button>
                                <Button onClick={() => { setShowFeaturesDetail(false); handleEditFeature(selectedFeature); }} className="h-8 px-4 rounded-full text-[12px] bg-[#145F33] hover:bg-[#0f4a26] text-white">Edit</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Medical Needs Add/Edit Dialog */}
            <Dialog open={showMedicalDialog} onOpenChange={setShowMedicalDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[18px] font-semibold">{editingMedicalId ? "Edit Medical Need" : "Add Medical Need"}</DialogTitle>
                        <DialogDescription className="text-[14px] text-[#525252]">{editingMedicalId ? "Update medical need information" : "Add new medical or physical need"}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label htmlFor="medType" className="text-[11px] font-semibold text-[#080707]">Type *</Label>
                            <Select value={medicalForm.type} onValueChange={(value) => setMedicalForm({...medicalForm, type: value})}>
                                <SelectTrigger className="mt-1 h-8 text-[13px]">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Medication Management">Medication Management</SelectItem>
                                    <SelectItem value="Medical Equipment">Medical Equipment</SelectItem>
                                    <SelectItem value="Allergy">Allergy</SelectItem>
                                    <SelectItem value="Chronic Condition">Chronic Condition</SelectItem>
                                    <SelectItem value="Mobility Assistance">Mobility Assistance</SelectItem>
                                    <SelectItem value="Vision/Hearing">Vision/Hearing</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="allergyType" className="text-[11px] font-semibold text-[#080707]">Allergy Type</Label>
                            <Select value={medicalForm.allergyType} onValueChange={(value) => setMedicalForm({...medicalForm, allergyType: value})}>
                                <SelectTrigger className="mt-1 h-8 text-[13px]">
                                    <SelectValue placeholder="Select allergy type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="N/A">N/A</SelectItem>
                                    <SelectItem value="Food">Food</SelectItem>
                                    <SelectItem value="Environmental">Environmental</SelectItem>
                                    <SelectItem value="Medication">Medication</SelectItem>
                                    <SelectItem value="Latex">Latex</SelectItem>
                                    <SelectItem value="Animal">Animal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="medStartDate" className="text-[11px] font-semibold text-[#080707]">Start Date *</Label>
                                <DateInput id="medStartDate"
value={isoToMdy(medicalForm.startDate)} onChange={(v) => ((e) => setMedicalForm({...medicalForm, startDate: e.target.value}))({ target: { value: mdyToIso(v) } })} className="mt-1 h-8 text-[13px]" />
                            </div>
                            <div>
                                <Label htmlFor="medEndDate" className="text-[11px] font-semibold text-[#080707]">End Date</Label>
                                <DateInput id="medEndDate"
value={isoToMdy(medicalForm.endDate)} onChange={(v) => ((e) => setMedicalForm({...medicalForm, endDate: e.target.value}))({ target: { value: mdyToIso(v) } })} className="mt-1 h-8 text-[13px]" />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="medDetails" className="text-[11px] font-semibold text-[#080707]">Details *</Label>
                            <Textarea id="medDetails" value={medicalForm.details} onChange={(e) => setMedicalForm({...medicalForm, details: e.target.value})} className="mt-1 min-h-[100px] text-[13px]" placeholder="Detailed information about the medical need..." />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <Button onClick={() => setShowMedicalDialog(false)} variant="outline" className="h-8 px-4 rounded-full text-[12px]">Cancel</Button>
                        <Button onClick={handleSaveMedical} className="h-8 px-4 rounded-full text-[12px] bg-[#145F33] hover:bg-[#0f4a26] text-white" disabled={!medicalForm.type || !medicalForm.startDate || !medicalForm.details}>
                            {editingMedicalId ? "Update" : "Create"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dietary Needs Add/Edit Dialog */}
            <Dialog open={showDietaryDialog} onOpenChange={setShowDietaryDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[18px] font-semibold">{editingDietaryId ? "Edit Dietary Need" : "Add Dietary Need"}</DialogTitle>
                        <DialogDescription className="text-[14px] text-[#525252]">{editingDietaryId ? "Update dietary need information" : "Add new dietary need or restriction"}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label htmlFor="dietType" className="text-[11px] font-semibold text-[#080707]">Type *</Label>
                            <Select value={dietaryForm.type} onValueChange={(value) => setDietaryForm({...dietaryForm, type: value})}>
                                <SelectTrigger className="mt-1 h-8 text-[13px]">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Food Allergy">Food Allergy</SelectItem>
                                    <SelectItem value="Dietary Restriction">Dietary Restriction</SelectItem>
                                    <SelectItem value="Medical Diet">Medical Diet</SelectItem>
                                    <SelectItem value="Religious/Cultural">Religious/Cultural</SelectItem>
                                    <SelectItem value="Personal Preference">Personal Preference</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="allergy" className="text-[11px] font-semibold text-[#080707]">Specific Allergy</Label>
                            <Input id="allergy" value={dietaryForm.allergy} onChange={(e) => setDietaryForm({...dietaryForm, allergy: e.target.value})} className="mt-1 h-8 text-[13px]" placeholder="e.g., Tree Nuts, Shellfish, Gluten" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="dietStartDate" className="text-[11px] font-semibold text-[#080707]">Start Date *</Label>
                                <DateInput id="dietStartDate"
value={isoToMdy(dietaryForm.startDate)} onChange={(v) => ((e) => setDietaryForm({...dietaryForm, startDate: e.target.value}))({ target: { value: mdyToIso(v) } })} className="mt-1 h-8 text-[13px]" />
                            </div>
                            <div>
                                <Label htmlFor="dietEndDate" className="text-[11px] font-semibold text-[#080707]">End Date</Label>
                                <DateInput id="dietEndDate"
value={isoToMdy(dietaryForm.endDate)} onChange={(v) => ((e) => setDietaryForm({...dietaryForm, endDate: e.target.value}))({ target: { value: mdyToIso(v) } })} className="mt-1 h-8 text-[13px]" />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="dietDetails" className="text-[11px] font-semibold text-[#080707]">Details *</Label>
                            <Textarea id="dietDetails" value={dietaryForm.details} onChange={(e) => setDietaryForm({...dietaryForm, details: e.target.value})} className="mt-1 min-h-[100px] text-[13px]" placeholder="Detailed information about the dietary need..." />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <Button onClick={() => setShowDietaryDialog(false)} variant="outline" className="h-8 px-4 rounded-full text-[12px]">Cancel</Button>
                        <Button onClick={handleSaveDietary} className="h-8 px-4 rounded-full text-[12px] bg-[#145F33] hover:bg-[#0f4a26] text-white" disabled={!dietaryForm.type || !dietaryForm.startDate || !dietaryForm.details}>
                            {editingDietaryId ? "Update" : "Create"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Identifying Features Add/Edit Dialog */}
            <Dialog open={showFeaturesDialog} onOpenChange={setShowFeaturesDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[18px] font-semibold">{editingFeatureId ? "Edit Identifying Feature" : "Add Identifying Feature"}</DialogTitle>
                        <DialogDescription className="text-[14px] text-[#525252]">{editingFeatureId ? "Update identifying feature information" : "Add new identifying feature"}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label htmlFor="dateReported" className="text-[11px] font-semibold text-[#080707]">Date Reported *</Label>
                            <DateInput id="dateReported"
value={isoToMdy(featureForm.dateReported)} onChange={(v) => ((e) => setFeatureForm({...featureForm, dateReported: e.target.value}))({ target: { value: mdyToIso(v) } })} className="mt-1 h-8 text-[13px]" />
                        </div>
                        <div>
                            <Label htmlFor="featureType" className="text-[11px] font-semibold text-[#080707]">Type *</Label>
                            <Select value={featureForm.type} onValueChange={(value) => setFeatureForm({...featureForm, type: value})}>
                                <SelectTrigger className="mt-1 h-8 text-[13px]">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Birthmark">Birthmark</SelectItem>
                                    <SelectItem value="Scar">Scar</SelectItem>
                                    <SelectItem value="Tattoo">Tattoo</SelectItem>
                                    <SelectItem value="Piercing">Piercing</SelectItem>
                                    <SelectItem value="Physical Characteristic">Physical Characteristic</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="location" className="text-[11px] font-semibold text-[#080707]">Location *</Label>
                            <Input id="location" value={featureForm.location} onChange={(e) => setFeatureForm({...featureForm, location: e.target.value})} className="mt-1 h-8 text-[13px]" placeholder="e.g., Left shoulder, Right knee" />
                        </div>
                        <div>
                            <Label htmlFor="featureDetails" className="text-[11px] font-semibold text-[#080707]">Details *</Label>
                            <Textarea id="featureDetails" value={featureForm.details} onChange={(e) => setFeatureForm({...featureForm, details: e.target.value})} className="mt-1 min-h-[100px] text-[13px]" placeholder="Detailed description of the identifying feature..." />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <Button onClick={() => setShowFeaturesDialog(false)} variant="outline" className="h-8 px-4 rounded-full text-[12px]">Cancel</Button>
                        <Button onClick={handleSaveFeature} className="h-8 px-4 rounded-full text-[12px] bg-[#145F33] hover:bg-[#0f4a26] text-white" disabled={!featureForm.dateReported || !featureForm.type || !featureForm.location || !featureForm.details}>
                            {editingFeatureId ? "Update" : "Create"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
