import { useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Edit2, Plus, AlertTriangle } from "@/app/lib/lucide-icons";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export function MentalHealthHistorySection() {
    const [isEditing, setIsEditing] = useState(false);
    
    const [historyData, setHistoryData] = useState({
        currentAsOf: "N/A",
        previousDiagnoses: "Youth was previously diagnosed with Oppositional Defiant Disorder (ODD) at age 9, which was later re-evaluated and determined to be trauma-related behaviors. Anxiety disorder was diagnosed at age 11 following a significant traumatic event. Youth has shown improvement with consistent therapy and medication management.",
        comments: "Youth has been actively engaged in trauma-focused cognitive behavioral therapy (TF-CBT) for the past 18 months with notable progress. Demonstrates strong coping skills development. Family therapy sessions have helped improve communication patterns. Youth reports feeling more emotionally regulated and better equipped to handle stressors. Continued therapy recommended with quarterly medication reviews."
    });

    const [treatmentHistory, setTreatmentHistory] = useState([
        {
            id: "TH-001",
            treatmentType: "Trauma-Focused CBT",
            location: "Mercy Home Mental Health Clinic",
            duration: "18 months (ongoing)",
            reason: "PTSD, Trauma Processing",
            outcome: "Positive - Significant improvement in trauma symptoms"
        },
        {
            id: "TH-002",
            treatmentType: "Family Therapy",
            location: "Family Support Center",
            duration: "12 months",
            reason: "Family communication, Support system development",
            outcome: "Positive - Improved family dynamics"
        },
        {
            id: "TH-003",
            treatmentType: "Group Therapy",
            location: "Youth Wellness Center",
            duration: "6 months",
            reason: "Social skills, Peer support",
            outcome: "Positive - Enhanced social connections"
        },
        {
            id: "TH-004",
            treatmentType: "Medication Management",
            location: "Psychiatric Clinic",
            duration: "2 years (ongoing)",
            reason: "ADHD, Depression",
            outcome: "Positive - Symptoms well-controlled"
        }
    ]);

    const [symptomsData, setSymptomsData] = useState({
        anxiety: "Moderate",
        depression: "Mild",
        aggression: "None",
        selfHarm: "None",
        suicidalIdeation: "None",
        sleepDisturbances: "Mild",
        concentrationIssues: "Moderate",
        moodSwings: "Mild"
    });

    const [showTreatmentDialog, setShowTreatmentDialog] = useState(false);
    const [editingTreatmentId, setEditingTreatmentId] = useState<string | null>(null);
    const [treatmentForm, setTreatmentForm] = useState({
        treatmentType: "",
        location: "",
        duration: "",
        reason: "",
        outcome: ""
    });

    const handleAddTreatment = () => {
        setEditingTreatmentId(null);
        setTreatmentForm({
            treatmentType: "",
            location: "",
            duration: "",
            reason: "",
            outcome: ""
        });
        setShowTreatmentDialog(true);
    };

    const handleEditTreatment = (treatment: any) => {
        setEditingTreatmentId(treatment.id);
        setTreatmentForm({
            treatmentType: treatment.treatmentType,
            location: treatment.location,
            duration: treatment.duration,
            reason: treatment.reason,
            outcome: treatment.outcome
        });
        setShowTreatmentDialog(true);
    };

    const handleSaveTreatment = () => {
        if (editingTreatmentId) {
            setTreatmentHistory(treatmentHistory.map(t => 
                t.id === editingTreatmentId 
                    ? { ...t, ...treatmentForm }
                    : t
            ));
        } else {
            const newTreatment = {
                id: `TH-${String(treatmentHistory.length + 1).padStart(3, '0')}`,
                ...treatmentForm
            };
            setTreatmentHistory([...treatmentHistory, newTreatment]);
        }
        setShowTreatmentDialog(false);
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
                    <h3 className="text-[13px] font-semibold text-[#080707]">Mental Health History</h3>
                    <Button
                        onClick={() => setIsEditing(!isEditing)}
                        variant={isEditing ? "default" : "outline"}
                        className={`h-7 px-3 rounded-full text-[11px] font-medium ${
                            isEditing 
                                ? "bg-[#145F33] hover:bg-[#0f4a26] text-white" 
                                : ""
                        }`}
                    >
                        <Edit2 className="h-3 w-3 mr-1" />
                        {isEditing ? "Save" : "Edit"}
                    </Button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Current As Of */}
                    <div>
                        <Label className="text-[11px] font-semibold text-[#706e6b]">Mental Health History</Label>
                        <div className="text-[13px] mt-1 text-[#080707]">Current As Of {historyData.currentAsOf}</div>
                    </div>

                    {/* Mental Health Treatment History */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-[13px] font-semibold text-[#080707]">Mental Health Treatment History</h4>
                            <Button
                                onClick={handleAddTreatment}
                                className="h-7 px-3 rounded-full text-[11px] font-medium bg-[#145F33] hover:bg-[#0f4a26] text-white"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Treatment
                            </Button>
                        </div>
                        
                        {treatmentHistory.length === 0 ? (
                            <div className="text-center py-8" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-40" />
                                <p className="text-[13px]">No treatment history recorded</p>
                            </div>
                        ) : (
                            <div 
                                className="overflow-hidden"
                                style={{
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    borderRadius: 'var(--slds-c-card-radius-border)'
                                }}
                            >
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                                <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Treatment Type</TableHead>
                                                <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Location</TableHead>
                                                <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Duration</TableHead>
                                                <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Reason</TableHead>
                                                <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Outcome</TableHead>
                                                <TableHead className="text-[11px] font-semibold text-[#080707] px-3 py-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {treatmentHistory.map((treatment, index) => (
                                                <TableRow 
                                                    key={treatment.id}
                                                    style={{ 
                                                        borderBottom: index < treatmentHistory.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                                    }}
                                                >
                                                    <TableCell className="px-3 py-3 text-[13px] text-[#080707] font-medium">{treatment.treatmentType}</TableCell>
                                                    <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{treatment.location}</TableCell>
                                                    <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{treatment.duration}</TableCell>
                                                    <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{treatment.reason}</TableCell>
                                                    <TableCell className="px-3 py-3 text-[13px] text-[#080707]">{treatment.outcome}</TableCell>
                                                    <TableCell className="px-3 py-3">
                                                        <Button
                                                            onClick={() => handleEditTreatment(treatment)}
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
                            </div>
                        )}
                    </div>

                    {/* Symptoms of Psychological Distress */}
                    <div>
                        <h4 className="text-[13px] font-semibold text-[#080707] mb-3">Symptoms of Psychological Distress</h4>
                        <div 
                            className="p-4 space-y-3"
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                borderRadius: 'var(--slds-c-card-radius-border)',
                                backgroundColor: 'var(--slds-g-color-background-alt)'
                            }}
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Anxiety</Label>
                                    {isEditing ? (
                                        <Select
                                            value={symptomsData.anxiety}
                                            onValueChange={(value) => setSymptomsData({...symptomsData, anxiety: value})}
                                        >
                                            <SelectTrigger className="mt-1 h-8 text-[13px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                <SelectItem value="Mild">Mild</SelectItem>
                                                <SelectItem value="Moderate">Moderate</SelectItem>
                                                <SelectItem value="Severe">Severe</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="text-[13px] mt-1 text-[#080707]">{symptomsData.anxiety}</div>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Depression</Label>
                                    {isEditing ? (
                                        <Select
                                            value={symptomsData.depression}
                                            onValueChange={(value) => setSymptomsData({...symptomsData, depression: value})}
                                        >
                                            <SelectTrigger className="mt-1 h-8 text-[13px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                <SelectItem value="Mild">Mild</SelectItem>
                                                <SelectItem value="Moderate">Moderate</SelectItem>
                                                <SelectItem value="Severe">Severe</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="text-[13px] mt-1 text-[#080707]">{symptomsData.depression}</div>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Aggression</Label>
                                    {isEditing ? (
                                        <Select
                                            value={symptomsData.aggression}
                                            onValueChange={(value) => setSymptomsData({...symptomsData, aggression: value})}
                                        >
                                            <SelectTrigger className="mt-1 h-8 text-[13px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                <SelectItem value="Mild">Mild</SelectItem>
                                                <SelectItem value="Moderate">Moderate</SelectItem>
                                                <SelectItem value="Severe">Severe</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="text-[13px] mt-1 text-[#080707]">{symptomsData.aggression}</div>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Self-Harm Behaviors</Label>
                                    {isEditing ? (
                                        <Select
                                            value={symptomsData.selfHarm}
                                            onValueChange={(value) => setSymptomsData({...symptomsData, selfHarm: value})}
                                        >
                                            <SelectTrigger className="mt-1 h-8 text-[13px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                <SelectItem value="Past">Past</SelectItem>
                                                <SelectItem value="Current">Current</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="text-[13px] mt-1 text-[#080707]">{symptomsData.selfHarm}</div>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Suicidal Ideation</Label>
                                    {isEditing ? (
                                        <Select
                                            value={symptomsData.suicidalIdeation}
                                            onValueChange={(value) => setSymptomsData({...symptomsData, suicidalIdeation: value})}
                                        >
                                            <SelectTrigger className="mt-1 h-8 text-[13px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                <SelectItem value="Past">Past</SelectItem>
                                                <SelectItem value="Current">Current</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="text-[13px] mt-1 text-[#080707]">{symptomsData.suicidalIdeation}</div>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Sleep Disturbances</Label>
                                    {isEditing ? (
                                        <Select
                                            value={symptomsData.sleepDisturbances}
                                            onValueChange={(value) => setSymptomsData({...symptomsData, sleepDisturbances: value})}
                                        >
                                            <SelectTrigger className="mt-1 h-8 text-[13px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                <SelectItem value="Mild">Mild</SelectItem>
                                                <SelectItem value="Moderate">Moderate</SelectItem>
                                                <SelectItem value="Severe">Severe</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="text-[13px] mt-1 text-[#080707]">{symptomsData.sleepDisturbances}</div>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Concentration Issues</Label>
                                    {isEditing ? (
                                        <Select
                                            value={symptomsData.concentrationIssues}
                                            onValueChange={(value) => setSymptomsData({...symptomsData, concentrationIssues: value})}
                                        >
                                            <SelectTrigger className="mt-1 h-8 text-[13px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                <SelectItem value="Mild">Mild</SelectItem>
                                                <SelectItem value="Moderate">Moderate</SelectItem>
                                                <SelectItem value="Severe">Severe</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="text-[13px] mt-1 text-[#080707]">{symptomsData.concentrationIssues}</div>
                                    )}
                                </div>
                                <div>
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Mood Swings</Label>
                                    {isEditing ? (
                                        <Select
                                            value={symptomsData.moodSwings}
                                            onValueChange={(value) => setSymptomsData({...symptomsData, moodSwings: value})}
                                        >
                                            <SelectTrigger className="mt-1 h-8 text-[13px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                <SelectItem value="Mild">Mild</SelectItem>
                                                <SelectItem value="Moderate">Moderate</SelectItem>
                                                <SelectItem value="Severe">Severe</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="text-[13px] mt-1 text-[#080707]">{symptomsData.moodSwings}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Previous Diagnoses */}
                    <div>
                        <Label className="text-[11px] font-semibold text-[#706e6b]">Previous Diagnoses</Label>
                        {isEditing ? (
                            <Textarea
                                value={historyData.previousDiagnoses}
                                onChange={(e) => setHistoryData({...historyData, previousDiagnoses: e.target.value})}
                                className="mt-1 min-h-[80px] text-[13px]"
                            />
                        ) : (
                            <div className="text-[13px] mt-1 text-[#080707] whitespace-pre-wrap">{historyData.previousDiagnoses}</div>
                        )}
                    </div>

                    {/* Comments */}
                    <div>
                        <Label className="text-[11px] font-semibold text-[#706e6b]">Comments</Label>
                        {isEditing ? (
                            <Textarea
                                value={historyData.comments}
                                onChange={(e) => setHistoryData({...historyData, comments: e.target.value})}
                                className="mt-1 min-h-[100px] text-[13px]"
                            />
                        ) : (
                            <div className="text-[13px] mt-1 text-[#080707] whitespace-pre-wrap">{historyData.comments}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Treatment History Dialog */}
            <Dialog open={showTreatmentDialog} onOpenChange={setShowTreatmentDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[18px] font-semibold">
                            {editingTreatmentId ? "Edit Treatment History" : "Add Treatment History"}
                        </DialogTitle>
                        <DialogDescription className="text-[14px] text-[#525252]">
                            {editingTreatmentId ? "Update treatment information" : "Add new treatment history record"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Label htmlFor="treatmentType" className="text-[11px] font-semibold text-[#080707]">Treatment Type *</Label>
                            <Input
                                id="treatmentType"
                                value={treatmentForm.treatmentType}
                                onChange={(e) => setTreatmentForm({...treatmentForm, treatmentType: e.target.value})}
                                className="mt-1 h-8 text-[13px]"
                                placeholder="e.g., Cognitive Behavioral Therapy"
                            />
                        </div>
                        <div>
                            <Label htmlFor="location" className="text-[11px] font-semibold text-[#080707]">Location *</Label>
                            <Input
                                id="location"
                                value={treatmentForm.location}
                                onChange={(e) => setTreatmentForm({...treatmentForm, location: e.target.value})}
                                className="mt-1 h-8 text-[13px]"
                                placeholder="Treatment location"
                            />
                        </div>
                        <div>
                            <Label htmlFor="duration" className="text-[11px] font-semibold text-[#080707]">Duration *</Label>
                            <Input
                                id="duration"
                                value={treatmentForm.duration}
                                onChange={(e) => setTreatmentForm({...treatmentForm, duration: e.target.value})}
                                className="mt-1 h-8 text-[13px]"
                                placeholder="e.g., 6 months"
                            />
                        </div>
                        <div>
                            <Label htmlFor="reason" className="text-[11px] font-semibold text-[#080707]">Reason *</Label>
                            <Textarea
                                id="reason"
                                value={treatmentForm.reason}
                                onChange={(e) => setTreatmentForm({...treatmentForm, reason: e.target.value})}
                                className="mt-1 min-h-[60px] text-[13px]"
                                placeholder="Reason for treatment..."
                            />
                        </div>
                        <div>
                            <Label htmlFor="outcome" className="text-[11px] font-semibold text-[#080707]">Outcome *</Label>
                            <Textarea
                                id="outcome"
                                value={treatmentForm.outcome}
                                onChange={(e) => setTreatmentForm({...treatmentForm, outcome: e.target.value})}
                                className="mt-1 min-h-[60px] text-[13px]"
                                placeholder="Treatment outcome..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <Button
                            onClick={() => setShowTreatmentDialog(false)}
                            variant="outline"
                            className="h-8 px-4 rounded-full text-[12px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveTreatment}
                            className="h-8 px-4 rounded-full text-[12px] bg-[#145F33] hover:bg-[#0f4a26] text-white"
                            disabled={!treatmentForm.treatmentType || !treatmentForm.location || !treatmentForm.duration || !treatmentForm.reason || !treatmentForm.outcome}
                        >
                            {editingTreatmentId ? "Update" : "Create"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}