import { useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Plus, Pencil, Trash2 } from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface Trigger {
    id: number;
    trigger: string;
    severity: string;
    copingResponse: string;
    lastOccurrence: string;
}

export function PersonalDevelopmentTriggersSection() {
    const [triggers, setTriggers] = useState<Trigger[]>([
        { 
            id: 1, 
            trigger: "Conflict with authority figures", 
            severity: "High", 
            copingResponse: "Deep breathing, time-out in safe space, talk to therapist", 
            lastOccurrence: "2026-01-12" 
        },
        { 
            id: 2, 
            trigger: "Academic pressure and expectations", 
            severity: "Medium", 
            copingResponse: "Talk to education advocate, break tasks into smaller steps", 
            lastOccurrence: "2026-01-10" 
        },
        { 
            id: 3, 
            trigger: "Social rejection or exclusion from peers", 
            severity: "High", 
            copingResponse: "Journaling, reach out to trusted staff, use grounding techniques", 
            lastOccurrence: "2026-01-08" 
        },
        { 
            id: 4, 
            trigger: "Reminders of past family trauma", 
            severity: "High", 
            copingResponse: "DBT skills, talk to therapist, engage in physical activity", 
            lastOccurrence: "2026-01-11" 
        },
        { 
            id: 5, 
            trigger: "Feeling misunderstood or invalidated", 
            severity: "Medium", 
            copingResponse: "Use I-statements, request one-on-one time with staff", 
            lastOccurrence: "2026-01-13" 
        },
        { 
            id: 6, 
            trigger: "Transitions and changes in routine", 
            severity: "Medium", 
            copingResponse: "Prepare in advance, discuss feelings, maintain regular activities", 
            lastOccurrence: "2026-01-09" 
        },
        { 
            id: 7, 
            trigger: "Being told 'no' or experiencing limits", 
            severity: "Medium", 
            copingResponse: "Take deep breaths, accept reality, use distress tolerance skills", 
            lastOccurrence: "2026-01-14" 
        },
        { 
            id: 8, 
            trigger: "Lack of sleep or physical exhaustion", 
            severity: "Low", 
            copingResponse: "Prioritize rest, communicate needs, adjust schedule", 
            lastOccurrence: "2026-01-07" 
        },
        { 
            id: 9, 
            trigger: "Loud noises or chaotic environments", 
            severity: "Medium", 
            copingResponse: "Remove self from situation, use noise-canceling headphones, find quiet space", 
            lastOccurrence: "2026-01-13" 
        },
        { 
            id: 10, 
            trigger: "Discussions about biological family", 
            severity: "High", 
            copingResponse: "Request therapist check-in, use emotional regulation skills, journal", 
            lastOccurrence: "2026-01-10" 
        }
    ]);

    const [showAddTrigger, setShowAddTrigger] = useState(false);
    const [newTrigger, setNewTrigger] = useState({
        trigger: "",
        severity: "",
        copingResponse: "",
        lastOccurrence: ""
    });

    const handleAddTrigger = () => {
        if (!newTrigger.trigger || !newTrigger.severity) return;
        
        const newId = Math.max(...triggers.map(t => t.id), 0) + 1;
        setTriggers([...triggers, { id: newId, ...newTrigger }]);
        setNewTrigger({ trigger: "", severity: "", copingResponse: "", lastOccurrence: "" });
        setShowAddTrigger(false);
    };

    const handleDeleteTrigger = (id: number) => {
        setTriggers(triggers.filter(t => t.id !== id));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold text-[#080707]">Identified Triggers</h3>
                <Button
                    onClick={() => setShowAddTrigger(!showAddTrigger)}
                    className="h-8 px-3 rounded-full text-[13px]"
                    style={{
                        backgroundColor: '#145F33',
                        color: 'white'
                    }}
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Trigger
                </Button>
            </div>

            {showAddTrigger && (
                <div 
                    className="p-4 rounded space-y-3"
                    style={{
                        backgroundColor: 'var(--slds-g-color-background-alt)',
                        border: '1px solid var(--slds-g-color-border-base-1)'
                    }}
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-medium text-[#080707]">Trigger</Label>
                            <Input
                                value={newTrigger.trigger}
                                onChange={(e) => setNewTrigger({...newTrigger, trigger: e.target.value})}
                                className="h-8 text-[13px] rounded"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                }}
                                placeholder="Enter trigger"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-medium text-[#080707]">Severity</Label>
                            <Input
                                value={newTrigger.severity}
                                onChange={(e) => setNewTrigger({...newTrigger, severity: e.target.value})}
                                className="h-8 text-[13px] rounded"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                }}
                                placeholder="High, Medium, Low"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-medium text-[#080707]">Coping Response</Label>
                        <Input
                            value={newTrigger.copingResponse}
                            onChange={(e) => setNewTrigger({...newTrigger, copingResponse: e.target.value})}
                            className="h-8 text-[13px] rounded"
                            style={{
                                backgroundColor: 'var(--slds-g-color-background-base)',
                                borderColor: 'var(--slds-g-color-border-base-1)'
                            }}
                            placeholder="Enter coping response"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-medium text-[#080707]">Last Occurrence</Label>
                        <DateInput
value={isoToMdy(newTrigger.lastOccurrence)}
                            onChange={(v) => ((e) => setNewTrigger({...newTrigger, lastOccurrence: e.target.value}))({ target: { value: mdyToIso(v) } })}
                            className="h-8 text-[13px] rounded"
                            style={{
                                backgroundColor: 'var(--slds-g-color-background-base)',
                                borderColor: 'var(--slds-g-color-border-base-1)'
                            }}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            onClick={() => setShowAddTrigger(false)}
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
                            onClick={handleAddTrigger}
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

            {/* Triggers Table */}
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
                                    Trigger
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    Severity
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    Coping Response
                                </th>
                                <th className="px-3 py-2 text-left font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    Last Occurrence
                                </th>
                                <th className="px-3 py-2 text-right font-semibold text-[#080707]" style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {triggers.map((trigger, index) => (
                                <tr 
                                    key={trigger.id}
                                    style={{ 
                                        borderBottom: index < triggers.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none',
                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                    }}
                                >
                                    <td className="px-3 py-3 text-[#080707]">{trigger.trigger}</td>
                                    <td className="px-3 py-3">
                                        <Badge className={`rounded-sm ${
                                            trigger.severity === "High" ? "bg-red-50 text-red-700 border-red-200" :
                                            trigger.severity === "Medium" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                            "bg-gray-50 text-gray-700 border-gray-200"
                                        }`}>
                                            {trigger.severity}
                                        </Badge>
                                    </td>
                                    <td className="px-3 py-3 text-[#080707]">{trigger.copingResponse}</td>
                                    <td className="px-3 py-3 text-[#080707]">{trigger.lastOccurrence}</td>
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
                                                onClick={() => handleDeleteTrigger(trigger.id)}
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
