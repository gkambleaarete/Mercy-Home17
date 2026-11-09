import { useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Plus, Pencil, Trash2 } from "@/app/lib/lucide-icons";

interface Strength {
    id: number;
    strength: string;
    category: string;
    notes: string;
}

export function PersonalDevelopmentStrengthsSection() {
    const [strengths, setStrengths] = useState<Strength[]>([
        { 
            id: 1, 
            strength: "Strong desire to improve", 
            category: "Motivation", 
            notes: "Marcus expresses genuine commitment to treatment and shows consistent effort" 
        },
        { 
            id: 2, 
            strength: "Creative problem-solving", 
            category: "Cognitive", 
            notes: "Demonstrates innovative thinking in group activities and finds unique solutions" 
        },
        { 
            id: 3, 
            strength: "Resilience through adversity", 
            category: "Emotional", 
            notes: "Despite challenges, Marcus continues to persevere and maintain hope for the future" 
        },
        { 
            id: 4, 
            strength: "Artistic expression", 
            category: "Creative", 
            notes: "Uses art and writing as healthy outlets for emotional processing" 
        },
        { 
            id: 5, 
            strength: "Empathy for others", 
            category: "Social", 
            notes: "Shows genuine care and concern for peers, especially those who are struggling" 
        },
        { 
            id: 6, 
            strength: "Athletic ability", 
            category: "Physical", 
            notes: "Excels in basketball and uses sports as positive coping mechanism" 
        },
        { 
            id: 7, 
            strength: "Willingness to accept help", 
            category: "Interpersonal", 
            notes: "Open to feedback and guidance from staff and therapists" 
        },
        { 
            id: 8, 
            strength: "Strong verbal communication", 
            category: "Communication", 
            notes: "Able to articulate feelings and needs when in regulated state" 
        }
    ]);

    const [showAddStrength, setShowAddStrength] = useState(false);
    const [newStrength, setNewStrength] = useState({
        strength: "",
        category: "",
        notes: ""
    });

    const handleAddStrength = () => {
        if (!newStrength.strength || !newStrength.category) return;
        
        const newId = Math.max(...strengths.map(s => s.id), 0) + 1;
        setStrengths([...strengths, { id: newId, ...newStrength }]);
        setNewStrength({ strength: "", category: "", notes: "" });
        setShowAddStrength(false);
    };

    const handleDeleteStrength = (id: number) => {
        setStrengths(strengths.filter(s => s.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-[#080707]">Identified Strengths</h3>
                <Button
                    onClick={() => setShowAddStrength(!showAddStrength)}
                    className="h-8 px-3 rounded-full text-[13px]"
                    style={{
                        backgroundColor: '#145F33',
                        color: 'white'
                    }}
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Strength
                </Button>
            </div>

            {showAddStrength && (
                <div 
                    className="p-4 rounded space-y-3"
                    style={{
                        backgroundColor: 'var(--slds-g-color-background-alt)',
                        border: '1px solid var(--slds-g-color-border-base-1)'
                    }}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-medium text-[#080707]">Strength</Label>
                            <Input
                                value={newStrength.strength}
                                onChange={(e) => setNewStrength({...newStrength, strength: e.target.value})}
                                className="h-8 text-[13px] rounded"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                }}
                                placeholder="Enter strength"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-medium text-[#080707]">Category</Label>
                            <Input
                                value={newStrength.category}
                                onChange={(e) => setNewStrength({...newStrength, category: e.target.value})}
                                className="h-8 text-[13px] rounded"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                }}
                                placeholder="Enter category"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-medium text-[#080707]">Notes</Label>
                        <Textarea
                            value={newStrength.notes}
                            onChange={(e) => setNewStrength({...newStrength, notes: e.target.value})}
                            className="text-[13px] rounded min-h-[80px]"
                            style={{
                                backgroundColor: 'var(--slds-g-color-background-base)',
                                borderColor: 'var(--slds-g-color-border-base-1)'
                            }}
                            placeholder="Enter notes"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            onClick={() => setShowAddStrength(false)}
                            className="h-8 px-3 rounded-full text-[13px]"
                            style={{
                                backgroundColor: 'transparent',
                                color: '#706e6b',
                                border: '1px solid var(--slds-g-color-border-base-1)'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddStrength}
                            className="h-8 px-3 rounded-full text-[13px]"
                            style={{
                                backgroundColor: '#145F33',
                                color: 'white'
                            }}
                        >
                            Add
                        </Button>
                    </div>
                </div>
            )}

            {/* Strengths Table */}
            <div 
                className="rounded overflow-hidden"
                style={{
                    border: '1px solid var(--slds-g-color-border-base-1)'
                }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                        <thead>
                            <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    Strength
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    Category
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    Notes
                                </th>
                                <th className="px-3 py-2 text-right font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {strengths.map((strength, index) => (
                                <tr 
                                    key={strength.id}
                                    style={{ 
                                        borderBottom: index < strengths.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                    }}
                                >
                                    <td className="px-3 py-3 text-[#080707]">{strength.strength}</td>
                                    <td className="px-3 py-3 text-[#080707]">{strength.category}</td>
                                    <td className="px-3 py-3 text-[#080707]">{strength.notes}</td>
                                    <td className="px-3 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                className="text-[#0176d3] hover:text-[#014486] text-[13px] flex items-center gap-1"
                                                onClick={() => {/* Edit handler can be added */}}
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                                Edit
                                            </button>
                                            <button
                                                className="text-[#c23934] hover:text-[#8a2a27] text-[13px] flex items-center gap-1"
                                                onClick={() => handleDeleteStrength(strength.id)}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
