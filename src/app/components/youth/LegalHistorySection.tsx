import { useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Edit2, Save } from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy } from "../../lib/dateFormat";

export function LegalHistorySection() {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        currentAsOf: "2025-01-10",
        beenArrested: "No",
        beenDetained: "No",
        beenCharged: "Yes",
        pleadedGuilty: "Yes",
        beenOnProbation: "Yes",
        beenOnParole: "No",
        summary: "Youth has prior involvement with juvenile justice system. Arrested once in 2023 for petty theft. Charges were reduced and youth was placed on probation. Successfully completed probation requirements in December 2024. No current active legal matters. Youth demonstrates improved decision-making and understands consequences of previous actions."
    });

    const handleSave = () => {
        setIsEditing(false);
        // Save logic would go here
    };

    const questions = [
        { id: "beenArrested", label: "Been arrested?" },
        { id: "beenDetained", label: "Been detained or incarcerated?" },
        { id: "beenCharged", label: "Been charged with a crime?" },
        { id: "pleadedGuilty", label: "Pleaded or been found guilty of a crime?" },
        { id: "beenOnProbation", label: "Been on probation?" },
        { id: "beenOnParole", label: "Been on parole?" }
    ];

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
                {/* Header */}
                <div 
                    className="px-4 py-3 flex items-center justify-between"
                    style={{
                        borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                        backgroundColor: 'var(--slds-g-color-background-alt)'
                    }}
                >
                    <div className="flex items-center gap-3">
                        <h3 className="text-[13px] font-semibold text-[#080707]">
                            Legal History
                        </h3>
                        <span className="text-[13px] text-[#706e6b]">—</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] text-[#706e6b]">Current as of</span>
                            {isEditing ? (
                                <DateInput
                                    id="currentAsOf"
value={isoToMdy(formData.currentAsOf)}
                                    onChange={(v) => ((e) => setFormData({...formData, currentAsOf: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                    className="h-6 w-36 text-[12px]"
                                />
                            ) : (
                                <span className="text-[13px] text-[#080707] font-medium">
                                    {formatMdy(new Date(formData.currentAsOf))}
                                </span>
                            )}
                        </div>
                    </div>
                    <Button 
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                        className="h-7 px-3 rounded-full text-[11px] font-medium"
                        style={{
                            backgroundColor: isEditing ? '#145F33' : 'transparent',
                            color: isEditing ? 'white' : 'var(--color-brand-primary)',
                            border: isEditing ? 'none' : '1px solid var(--slds-g-color-border-base-1)'
                        }}
                    >
                        {isEditing ? (
                            <>
                                <Save className="h-3 w-3 mr-1" />
                                Save
                            </>
                        ) : (
                            <>
                                <Edit2 className="h-3 w-3 mr-1" />
                                Edit
                            </>
                        )}
                    </Button>
                </div>

                {/* Form Content */}
                <div className="p-5 space-y-6">
                    {/* Questions Section */}
                    <div>
                        <h4 className="text-[13px] text-[#3e3e3c] mb-4" style={{ letterSpacing: '0.02em' }}>
                            HAS THE YOUTH EVER...
                        </h4>
                        <div className="space-y-3">
                            {questions.map((question) => (
                                <div key={question.id} className="grid grid-cols-[1fr_240px] gap-8 items-center py-2">
                                    <Label htmlFor={question.id} className="text-[13px] text-[#080707]">
                                        {question.label}
                                    </Label>
                                    {isEditing ? (
                                        <RadioGroup
                                            id={question.id}
                                            value={formData[question.id as keyof typeof formData] as string}
                                            onValueChange={(value) => setFormData({...formData, [question.id]: value})}
                                            className="flex items-center gap-5"
                                        >
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem 
                                                    value="Yes" 
                                                    id={`${question.id}-yes`}
                                                    className="h-4 w-4"
                                                />
                                                <Label 
                                                    htmlFor={`${question.id}-yes`} 
                                                    className="text-[13px] cursor-pointer text-[#3e3e3c] font-normal"
                                                >
                                                    Yes
                                                </Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem 
                                                    value="No" 
                                                    id={`${question.id}-no`}
                                                    className="h-4 w-4"
                                                />
                                                <Label 
                                                    htmlFor={`${question.id}-no`} 
                                                    className="text-[13px] cursor-pointer text-[#3e3e3c] font-normal"
                                                >
                                                    No
                                                </Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <RadioGroupItem 
                                                    value="Unknown" 
                                                    id={`${question.id}-unknown`}
                                                    className="h-4 w-4"
                                                />
                                                <Label 
                                                    htmlFor={`${question.id}-unknown`} 
                                                    className="text-[13px] cursor-pointer text-[#3e3e3c] font-normal"
                                                >
                                                    Unknown
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    ) : (
                                        <div className="flex items-center">
                                            <span 
                                                className="inline-flex items-center justify-center px-3 py-1 text-[12px] font-medium rounded-full min-w-[80px]"
                                                style={{
                                                    backgroundColor: formData[question.id as keyof typeof formData] === 'Yes' 
                                                        ? '#fef7f0' 
                                                        : formData[question.id as keyof typeof formData] === 'No'
                                                        ? '#f4f6f9'
                                                        : '#fefaf5',
                                                    color: formData[question.id as keyof typeof formData] === 'Yes' 
                                                        ? '#a86403' 
                                                        : formData[question.id as keyof typeof formData] === 'No'
                                                        ? '#3e3e3c'
                                                        : '#706e6b'
                                                }}
                                            >
                                                {formData[question.id as keyof typeof formData] as string}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="space-y-2.5 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <Label htmlFor="summary" className="text-[13px] text-[#3e3e3c]">
                            Summary
                        </Label>
                        <Textarea
                            id="summary"
                            value={formData.summary}
                            onChange={(e) => setFormData({...formData, summary: e.target.value})}
                            disabled={!isEditing}
                            className="min-h-[100px] text-[13px] resize-none leading-relaxed"
                            style={{
                                backgroundColor: isEditing ? 'white' : '#fafaf9',
                                cursor: isEditing ? 'text' : 'default',
                                borderColor: isEditing ? 'var(--slds-g-color-border-base-1)' : '#e5e5e3'
                            }}
                            placeholder="Enter legal history summary..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}