import { useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Badge } from "../ui/badge";
import { Edit2, Save } from "@/app/lib/lucide-icons";

export function PhysicalHealthHistorySection() {
    const [isEditing, setIsEditing] = useState(false);
    
    const [formData, setFormData] = useState({
        chronicIllness: "No",
        chronicIllnessDetails: "",
        injury: "Yes",
        injuryDetails: "Fractured right wrist (2022) - fully healed. ACL tear left knee (2023) - post-surgical recovery complete.",
        surgery: "Yes",
        surgeryDetails: "ACL reconstruction surgery - left knee (March 2023). Appendectomy (2019).",
        medicalHospitalization: "Yes",
        medicalHospitalizationDetails: "Hospitalized for appendicitis (2019) - 3 days. Post-surgical monitoring for ACL repair (2023) - overnight observation.",
        asthma: "No",
        asthmaDetails: "",
        allergies: "Yes",
        allergiesDetails: "Tree nuts (severe - anaphylaxis risk). Seasonal allergies (ragweed, pollen).",
        epiPen: "Yes",
        epiPenDetails: "EpiPen prescribed for tree nut allergy. Carries at all times. Staff trained in administration. Stored in medical office with backup.",
        eatingHabits: "Good",
        eatingHabitsDetails: "Generally healthy appetite. Prefers fruits and vegetables. Avoids dairy due to lactose intolerance. Proper portion control.",
        sleepingHabits: "Fair",
        sleepingHabitsDetails: "Occasional difficulty falling asleep. Average 6-7 hours per night. Nightmares 1-2x per week related to past trauma. Bedtime routine established.",
        hygieneHabits: "Good",
        hygieneHabitsDetails: "Maintains good personal hygiene independently. Daily showers, regular tooth brushing. Requires occasional reminders for laundry.",
        comments: "Overall physical health is good. Primary concerns are managing tree nut allergy and monitoring knee recovery. Sleep quality has improved with therapy but continues to be monitored. Youth is engaged in physical therapy exercises and shows good compliance with medical recommendations."
    });

    const handleSave = () => {
        setIsEditing(false);
        // Save logic would go here
    };

    const HealthHistoryItem = ({ 
        label, 
        value, 
        detailsKey, 
        detailsValue 
    }: { 
        label: string; 
        value: string; 
        detailsKey: string; 
        detailsValue: string;
    }) => (
        <div>
            <div className="mb-2">
                <Label className="text-[11px] font-semibold text-[#080707] mb-1.5 block">{label}</Label>
                <RadioGroup
                    value={value}
                    onValueChange={(newValue) => setFormData({...formData, [label.toLowerCase().replace(/\s+/g, '')]: newValue})}
                    disabled={!isEditing}
                    className="flex gap-4"
                >
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="Yes" id={`${detailsKey}-yes`} className="border-2" />
                        <Label htmlFor={`${detailsKey}-yes`} className="text-[13px] text-[#080707] cursor-pointer font-normal">Yes</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="No" id={`${detailsKey}-no`} className="border-2" />
                        <Label htmlFor={`${detailsKey}-no`} className="text-[13px] text-[#080707] cursor-pointer font-normal">No</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <RadioGroupItem value="Unknown" id={`${detailsKey}-unknown`} className="border-2" />
                        <Label htmlFor={`${detailsKey}-unknown`} className="text-[13px] text-[#080707] cursor-pointer font-normal">Unknown</Label>
                    </div>
                </RadioGroup>
            </div>
            {value === "Yes" && (
                <div className="mt-2">
                    <Label className="text-[11px] font-semibold text-[#706e6b]">Details</Label>
                    <Textarea
                        value={detailsValue}
                        onChange={(e) => setFormData({...formData, [detailsKey]: e.target.value})}
                        disabled={!isEditing}
                        className="mt-1 min-h-[60px] text-[13px]"
                        placeholder="Provide details..."
                    />
                </div>
            )}
        </div>
    );

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
                    <h3 className="text-[13px] font-semibold text-[#080707]">Physical Health History</h3>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)} 
                        className="h-7 rounded-full text-[11px] shadow-none"
                        style={{
                            border: '1px solid var(--slds-g-color-border-base-1)',
                            backgroundColor: 'var(--slds-g-color-background-base)',
                            color: 'var(--color-brand-primary)'
                        }}
                    >
                        {isEditing ? <><Save className="h-3 w-3 mr-1" />Save</> : <><Edit2 className="h-3 w-3 mr-1" />Edit</>}
                    </Button>
                </div>
                
                <div className="p-6">
                    {/* History or Current Presence Section */}
                    <div className="mb-6">
                        <h3 className="text-[14px] font-semibold mb-4 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                            History or Current Presence Of
                        </h3>
                        <div className="space-y-4">
                            <HealthHistoryItem
                                label="Chronic Illness"
                                value={formData.chronicIllness}
                                detailsKey="chronicIllnessDetails"
                                detailsValue={formData.chronicIllnessDetails}
                            />
                            <HealthHistoryItem
                                label="Injury"
                                value={formData.injury}
                                detailsKey="injuryDetails"
                                detailsValue={formData.injuryDetails}
                            />
                            <HealthHistoryItem
                                label="Surgery"
                                value={formData.surgery}
                                detailsKey="surgeryDetails"
                                detailsValue={formData.surgeryDetails}
                            />
                            <HealthHistoryItem
                                label="Medical Hospitalization"
                                value={formData.medicalHospitalization}
                                detailsKey="medicalHospitalizationDetails"
                                detailsValue={formData.medicalHospitalizationDetails}
                            />
                            <HealthHistoryItem
                                label="Asthma"
                                value={formData.asthma}
                                detailsKey="asthmaDetails"
                                detailsValue={formData.asthmaDetails}
                            />
                            <HealthHistoryItem
                                label="Allergies"
                                value={formData.allergies}
                                detailsKey="allergiesDetails"
                                detailsValue={formData.allergiesDetails}
                            />
                            <HealthHistoryItem
                                label="Epi-pen"
                                value={formData.epiPen}
                                detailsKey="epiPenDetails"
                                detailsValue={formData.epiPenDetails}
                            />
                        </div>
                    </div>

                    {/* Habits Section */}
                    <div className="mb-6">
                        <h3 className="text-[14px] font-semibold mb-4 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                            Habits
                        </h3>
                        <div className="space-y-4">
                            {/* Eating Habits */}
                            <div>
                                <Label className="text-[11px] font-semibold text-[#080707] mb-1.5 block">Eating Habits</Label>
                                <Select
                                    value={formData.eatingHabits}
                                    onValueChange={(value) => setFormData({...formData, eatingHabits: value})}
                                    disabled={!isEditing}
                                >
                                    <SelectTrigger className="h-8 text-[13px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Excellent">Excellent</SelectItem>
                                        <SelectItem value="Good">Good</SelectItem>
                                        <SelectItem value="Fair">Fair</SelectItem>
                                        <SelectItem value="Poor">Poor</SelectItem>
                                        <SelectItem value="Unknown">Unknown</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="mt-2">
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Details</Label>
                                    <Textarea
                                        value={formData.eatingHabitsDetails}
                                        onChange={(e) => setFormData({...formData, eatingHabitsDetails: e.target.value})}
                                        disabled={!isEditing}
                                        className="mt-1 min-h-[60px] text-[13px]"
                                        placeholder="Describe eating habits..."
                                    />
                                </div>
                            </div>

                            {/* Sleeping Habits */}
                            <div>
                                <Label className="text-[11px] font-semibold text-[#080707] mb-1.5 block">Sleeping Habits</Label>
                                <Select
                                    value={formData.sleepingHabits}
                                    onValueChange={(value) => setFormData({...formData, sleepingHabits: value})}
                                    disabled={!isEditing}
                                >
                                    <SelectTrigger className="h-8 text-[13px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Excellent">Excellent</SelectItem>
                                        <SelectItem value="Good">Good</SelectItem>
                                        <SelectItem value="Fair">Fair</SelectItem>
                                        <SelectItem value="Poor">Poor</SelectItem>
                                        <SelectItem value="Unknown">Unknown</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="mt-2">
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Details</Label>
                                    <Textarea
                                        value={formData.sleepingHabitsDetails}
                                        onChange={(e) => setFormData({...formData, sleepingHabitsDetails: e.target.value})}
                                        disabled={!isEditing}
                                        className="mt-1 min-h-[60px] text-[13px]"
                                        placeholder="Describe sleeping habits..."
                                    />
                                </div>
                            </div>

                            {/* Hygiene Habits */}
                            <div>
                                <Label className="text-[11px] font-semibold text-[#080707] mb-1.5 block">Hygiene Habits</Label>
                                <Select
                                    value={formData.hygieneHabits}
                                    onValueChange={(value) => setFormData({...formData, hygieneHabits: value})}
                                    disabled={!isEditing}
                                >
                                    <SelectTrigger className="h-8 text-[13px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Excellent">Excellent</SelectItem>
                                        <SelectItem value="Good">Good</SelectItem>
                                        <SelectItem value="Fair">Fair</SelectItem>
                                        <SelectItem value="Poor">Poor</SelectItem>
                                        <SelectItem value="Unknown">Unknown</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="mt-2">
                                    <Label className="text-[11px] font-semibold text-[#706e6b]">Details</Label>
                                    <Textarea
                                        value={formData.hygieneHabitsDetails}
                                        onChange={(e) => setFormData({...formData, hygieneHabitsDetails: e.target.value})}
                                        disabled={!isEditing}
                                        className="mt-1 min-h-[60px] text-[13px]"
                                        placeholder="Describe hygiene habits..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div>
                        <h3 className="text-[14px] font-semibold mb-4 pb-2" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)', color: '#080707' }}>
                            Comments
                        </h3>
                        <Textarea
                            value={formData.comments}
                            onChange={(e) => setFormData({...formData, comments: e.target.value})}
                            disabled={!isEditing}
                            className="min-h-[120px] text-[13px]"
                            placeholder="Additional comments or observations about physical health history..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}