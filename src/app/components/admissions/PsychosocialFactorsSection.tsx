import { useState } from "react";
import { Plus, Trash2 } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner@2.0.3";

interface FactorRow {
    id: number;
    factor: string;
    occurrences: string[];
}

export function PsychosocialFactorsSection() {
    const [rows, setRows] = useState<FactorRow[]>([
        { id: 1, factor: "", occurrences: [] }
    ]);

    const handleAddRow = () => {
        const newId = Math.max(...rows.map(r => r.id), 0) + 1;
        setRows([...rows, { id: newId, factor: "", occurrences: [] }]);
        toast.success("New row added");
    };

    const handleRemoveRow = (id: number) => {
        if (rows.length === 1) {
            toast.error("Cannot remove the last row");
            return;
        }
        setRows(rows.filter(row => row.id !== id));
        toast.success("Row removed");
    };

    const handleFactorChange = (id: number, value: string) => {
        setRows(rows.map(row => row.id === id ? { ...row, factor: value } : row));
    };

    const handleOccurrenceToggle = (id: number, value: string) => {
        setRows(rows.map(row => {
            if (row.id === id) {
                const occurrences = row.occurrences.includes(value)
                    ? row.occurrences.filter(o => o !== value)
                    : [...row.occurrences, value];
                return { ...row, occurrences };
            }
            return row;
        }));
    };

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-[13px] font-semibold text-[#080707]">Psychosocial Factors</h4>
                <Button
                    size="sm"
                    onClick={handleAddRow}
                    className="h-6 text-[11px] rounded-full bg-[#145F33] hover:bg-[#0f4a26] text-white"
                >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                </Button>
            </div>
            
            {/* Single Table with Factors and Occurrence */}
            <div 
              className="overflow-hidden"
              style={{
                border: '1px solid var(--slds-g-color-border-base-1)',
                borderRadius: '4px'
              }}
            >
                <table className="w-full text-[13px]">
                    <thead>
                        <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Factors</th>
                            <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Occurrence</th>
                            <th className="px-3 py-2 text-left font-semibold w-20" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.id} style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                                <td className="px-3 py-2">
                                    <Select
                                        value={row.factor}
                                        onValueChange={(value) => handleFactorChange(row.id, value)}
                                    >
                                        <SelectTrigger 
                                            className="h-8 text-[13px] border-0 shadow-none px-0 focus:ring-0"
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: 'var(--slds-g-color-text-default)'
                                            }}
                                        >
                                            <SelectValue placeholder="Select factor..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Academic Problems">Academic Problems</SelectItem>
                                            <SelectItem value="Behavioural Issues">Behavioural Issues</SelectItem>
                                            <SelectItem value="Community Issues">Community Issues</SelectItem>
                                            <SelectItem value="Financial Challenges">Financial Challenges</SelectItem>
                                            <SelectItem value="Family Issues">Family Issues</SelectItem>
                                            <SelectItem value="Independent Living Skills">Independent Living Skills</SelectItem>
                                            <SelectItem value="Mental Health Support">Mental Health Support</SelectItem>
                                            <SelectItem value="Substance Abuse Issues">Substance Abuse Issues</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <Checkbox
                                                id={`rare-${row.id}`}
                                                checked={row.occurrences.includes("Rare")}
                                                onCheckedChange={() => handleOccurrenceToggle(row.id, "Rare")}
                                            />
                                            <span className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>Rare</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <Checkbox
                                                id={`occasional-${row.id}`}
                                                checked={row.occurrences.includes("Occasional")}
                                                onCheckedChange={() => handleOccurrenceToggle(row.id, "Occasional")}
                                            />
                                            <span className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>Occasional</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <Checkbox
                                                id={`frequent-${row.id}`}
                                                checked={row.occurrences.includes("Frequent")}
                                                onCheckedChange={() => handleOccurrenceToggle(row.id, "Frequent")}
                                            />
                                            <span className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>Frequent</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <Checkbox
                                                id={`constant-${row.id}`}
                                                checked={row.occurrences.includes("Constant")}
                                                onCheckedChange={() => handleOccurrenceToggle(row.id, "Constant")}
                                            />
                                            <span className="text-[13px]" style={{ color: 'var(--slds-g-color-text-default)' }}>Constant</span>
                                        </label>
                                    </div>
                                </td>
                                <td className="px-3 py-2">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleRemoveRow(row.id)}
                                            className="p-1 hover:bg-[#f3f3f3] rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            title="Remove"
                                            disabled={rows.length === 1}
                                        >
                                            <Trash2 className="h-3.5 w-3.5 text-[#c23934]" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}