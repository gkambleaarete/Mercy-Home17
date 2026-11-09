import { useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Plus, Pencil, Trash2 } from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface CopingSkill {
    id: number;
    skill: string;
    category: string;
    effectiveness: string;
    lastPracticed: string;
}

export function PersonalDevelopmentCopingSkillsSection() {
    const [copingSkills, setCopingSkills] = useState<CopingSkill[]>([
        { 
            id: 1, 
            skill: "Deep breathing exercises", 
            category: "Relaxation", 
            effectiveness: "High", 
            lastPracticed: "2026-01-14" 
        },
        { 
            id: 2, 
            skill: "Journaling emotions and experiences", 
            category: "Emotional Expression", 
            effectiveness: "High", 
            lastPracticed: "2026-01-13" 
        },
        { 
            id: 3, 
            skill: "Progressive muscle relaxation", 
            category: "Relaxation", 
            effectiveness: "High", 
            lastPracticed: "2026-01-12" 
        },
        { 
            id: 4, 
            skill: "Calling a trusted friend or staff member", 
            category: "Social Support", 
            effectiveness: "Medium", 
            lastPracticed: "2026-01-11" 
        },
        { 
            id: 5, 
            skill: "Playing basketball or exercising", 
            category: "Physical Activity", 
            effectiveness: "High", 
            lastPracticed: "2026-01-14" 
        },
        { 
            id: 6, 
            skill: "Listening to calming music", 
            category: "Sensory", 
            effectiveness: "Medium", 
            lastPracticed: "2026-01-13" 
        },
        { 
            id: 7, 
            skill: "Using TIPP skill (cold water on face)", 
            category: "DBT - Distress Tolerance", 
            effectiveness: "High", 
            lastPracticed: "2026-01-13" 
        },
        { 
            id: 8, 
            skill: "Positive self-talk and affirmations", 
            category: "Cognitive", 
            effectiveness: "Medium", 
            lastPracticed: "2026-01-12" 
        },
        { 
            id: 9, 
            skill: "Taking a time-out in safe space", 
            category: "Self-Regulation", 
            effectiveness: "High", 
            lastPracticed: "2026-01-14" 
        },
        { 
            id: 10, 
            skill: "Drawing or creative art", 
            category: "Creative Expression", 
            effectiveness: "Medium", 
            lastPracticed: "2026-01-10" 
        },
        { 
            id: 11, 
            skill: "Grounding techniques (5-4-3-2-1)", 
            category: "Mindfulness", 
            effectiveness: "High", 
            lastPracticed: "2026-01-13" 
        },
        { 
            id: 12, 
            skill: "Reading or engaging with favorite book", 
            category: "Distraction", 
            effectiveness: "Low", 
            lastPracticed: "2026-01-08" 
        }
    ]);

    const [showAddCopingSkill, setShowAddCopingSkill] = useState(false);
    const [newCopingSkill, setNewCopingSkill] = useState({
        skill: "",
        category: "",
        effectiveness: "",
        lastPracticed: ""
    });

    const handleAddCopingSkill = () => {
        if (!newCopingSkill.skill || !newCopingSkill.category) return;
        
        const newId = Math.max(...copingSkills.map(c => c.id), 0) + 1;
        setCopingSkills([...copingSkills, { id: newId, ...newCopingSkill }]);
        setNewCopingSkill({ skill: "", category: "", effectiveness: "", lastPracticed: "" });
        setShowAddCopingSkill(false);
    };

    const handleDeleteCopingSkill = (id: number) => {
        setCopingSkills(copingSkills.filter(cs => cs.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-[#080707]">Coping Skills</h3>
                <Button
                    onClick={() => setShowAddCopingSkill(!showAddCopingSkill)}
                    className="h-8 px-3 rounded-full text-[13px]"
                    style={{
                        backgroundColor: '#145F33',
                        color: 'white'
                    }}
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Coping Skill
                </Button>
            </div>

            {showAddCopingSkill && (
                <div 
                    className="p-4 rounded space-y-3"
                    style={{
                        backgroundColor: 'var(--slds-g-color-background-alt)',
                        border: '1px solid var(--slds-g-color-border-base-1)'
                    }}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-medium text-[#080707]">Skill</Label>
                            <Input
                                value={newCopingSkill.skill}
                                onChange={(e) => setNewCopingSkill({...newCopingSkill, skill: e.target.value})}
                                className="h-8 text-[13px] rounded"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                }}
                                placeholder="Enter skill"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-medium text-[#080707]">Category</Label>
                            <Input
                                value={newCopingSkill.category}
                                onChange={(e) => setNewCopingSkill({...newCopingSkill, category: e.target.value})}
                                className="h-8 text-[13px] rounded"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                }}
                                placeholder="Enter category"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-medium text-[#080707]">Effectiveness</Label>
                            <Input
                                value={newCopingSkill.effectiveness}
                                onChange={(e) => setNewCopingSkill({...newCopingSkill, effectiveness: e.target.value})}
                                className="h-8 text-[13px] rounded"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                }}
                                placeholder="High, Medium, Low"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-medium text-[#080707]">Last Practiced</Label>
                            <DateInput
value={isoToMdy(newCopingSkill.lastPracticed)}
                                onChange={(v) => ((e) => setNewCopingSkill({...newCopingSkill, lastPracticed: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                className="h-8 text-[13px] rounded"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            onClick={() => setShowAddCopingSkill(false)}
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
                            onClick={handleAddCopingSkill}
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

            {/* Coping Skills Table */}
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
                                    Skill
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    Category
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    Effectiveness
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    Last Practiced
                                </th>
                                <th className="px-3 py-2 text-right font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {copingSkills.map((skill, index) => (
                                <tr 
                                    key={skill.id}
                                    style={{ 
                                        borderBottom: index < copingSkills.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                    }}
                                >
                                    <td className="px-3 py-3 text-[#080707]">{skill.skill}</td>
                                    <td className="px-3 py-3 text-[#080707]">{skill.category}</td>
                                    <td className="px-3 py-3">
                                        <Badge className={`rounded-sm ${
                                            skill.effectiveness === "High" ? "bg-green-50 text-green-700 border-green-200" :
                                            skill.effectiveness === "Medium" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                            "bg-gray-50 text-gray-700 border-gray-200"
                                        }`}>
                                            {skill.effectiveness}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-3 text-[#080707]">{skill.lastPracticed}</td>
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
                                                onClick={() => handleDeleteCopingSkill(skill.id)}
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
