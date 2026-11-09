import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { VisuallyHidden } from "../ui/visually-hidden";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Check, ChevronsUpDown } from "@/app/lib/lucide-icons";

// Mock data for existing youth in the system
const EXISTING_YOUTH = [
    { id: 101, name: "Marcus Johnson", youthId: "YTH-001", age: "16", status: "Active", program: "Residential - Main Campus" },
    { id: 102, name: "Jamal Williams", youthId: "YTH-002", age: "15", status: "Active", program: "Transitional Living" },
    { id: 103, name: "DeShawn Davis", youthId: "YTH-003", age: "17", status: "In Transition", program: "Independent Living" },
    { id: 104, name: "Terrence Brown", youthId: "YTH-004", age: "14", status: "Active", program: "Residential - Main Campus" },
    { id: 105, name: "Antoine Wilson", youthId: "YTH-005", age: "16", status: "Active", program: "Foster Care" },
    { id: 106, name: "Isaiah Martinez", youthId: "YTH-006", age: "15", status: "Active", program: "Residential - Main Campus" },
    { id: 107, name: "Xavier Thompson", youthId: "YTH-007", age: "17", status: "In Transition", program: "Transitional Living" },
    { id: 108, name: "Darius Anderson", youthId: "YTH-008", age: "16", status: "Active", program: "Independent Living" },
];

const STATUS_OPTIONS = [
    "Active",
    "In Transition",
    "Discharge Planning",
    "Alumni",
    "On Leave"
];

const PROGRAM_OPTIONS = [
    "Residential - Main Campus",
    "Transitional Living",
    "Independent Living",
    "Foster Care",
    "Outreach Services",
    "Alumni Support"
];

interface Youth {
    id: number;
    name: string;
    youthId: string;
    age: string;
    status: string;
    statusColor: string;
    program: string;
    initials: string;
    color: string;
    isPrimary: boolean;
}

interface AddEditYouthDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    youth: Youth | null;
    onSave: (youth: Youth) => void;
}

export function AddEditYouthDialog({ open, onOpenChange, youth, onSave }: AddEditYouthDialogProps) {
    const [name, setName] = useState("");
    const [youthId, setYouthId] = useState("");
    const [age, setAge] = useState("");
    const [status, setStatus] = useState("");
    const [program, setProgram] = useState("");
    const [nameComboOpen, setNameComboOpen] = useState(false);
    const [statusComboOpen, setStatusComboOpen] = useState(false);
    const [programComboOpen, setProgramComboOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Reset form when dialog opens/closes or youth changes
    useEffect(() => {
        if (open && youth) {
            // Editing existing youth
            setName(youth.name);
            setYouthId(youth.youthId);
            setAge(youth.age);
            setStatus(youth.status);
            setProgram(youth.program);
        } else if (open) {
            // Adding new youth
            setName("");
            setYouthId("");
            setAge("");
            setStatus("");
            setProgram("");
        }
    }, [open, youth]);

    const handleSave = () => {
        // Generate initials from name
        const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || '??';

        // Generate random color if new youth
        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500'];
        const color = youth?.color || colors[Math.floor(Math.random() * colors.length)];

        // Determine status color based on status text
        let statusColor = 'bg-gray-100 text-gray-800';
        if (status.toLowerCase().includes('active') || status.toLowerCase().includes('current')) {
            statusColor = 'bg-green-100 text-green-800';
        } else if (status.toLowerCase().includes('transition')) {
            statusColor = 'bg-yellow-100 text-yellow-800';
        } else if (status.toLowerCase().includes('discharge')) {
            statusColor = 'bg-red-100 text-red-800';
        }

        const updatedYouth: Youth = {
            id: youth?.id || Date.now(), // Use existing ID or generate new one
            name,
            youthId,
            age,
            status,
            statusColor,
            program,
            initials,
            color,
            isPrimary: youth?.isPrimary || false
        };

        onSave(updatedYouth);
        onOpenChange(false);
    };

    const isValid = name.trim() !== '';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogTitle className="text-lg font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    {youth ? 'Edit Youth' : 'Add Youth'}
                </DialogTitle>
                <VisuallyHidden>
                    <DialogDescription>{youth ? 'Edit youth information' : 'Add a new youth to this incident'}</DialogDescription>
                </VisuallyHidden>

                <div className="space-y-4 pt-4">
                    {/* Name - Combobox with search */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            Name <span className="text-red-600">*</span>
                        </Label>
                        <Popover open={nameComboOpen} onOpenChange={setNameComboOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm text-left"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        color: name ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)'
                                    }}
                                >
                                    <span className="truncate">{name || "Select or type youth name..."}</span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[460px] p-0" align="start">
                                <Command>
                                    <CommandInput 
                                        placeholder="Search youth..." 
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            <div className="py-6 text-center text-sm">
                                                <p style={{ color: 'var(--slds-g-color-text-weak)' }}>No youth found.</p>
                                                <button
                                                    type="button"
                                                    className="mt-2 text-sm font-medium"
                                                    style={{ color: 'var(--color-brand-primary)' }}
                                                    onClick={() => {
                                                        setNameComboOpen(false);
                                                    }}
                                                >
                                                    Type name above to add new youth
                                                </button>
                                            </div>
                                        </CommandEmpty>
                                        <CommandGroup heading="Existing Youth">
                                            {EXISTING_YOUTH.map((existingYouth) => (
                                                <CommandItem
                                                    key={existingYouth.id}
                                                    value={existingYouth.name}
                                                    onSelect={() => {
                                                        setName(existingYouth.name);
                                                        setYouthId(existingYouth.youthId);
                                                        setAge(existingYouth.age);
                                                        setStatus(existingYouth.status);
                                                        setProgram(existingYouth.program);
                                                        setNameComboOpen(false);
                                                    }}
                                                >
                                                    <Check 
                                                        className={`mr-2 h-4 w-4 ${name === existingYouth.name ? 'opacity-100' : 'opacity-0'}`}
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium">{existingYouth.name}</div>
                                                        <div className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                            {existingYouth.youthId} • Age {existingYouth.age} • {existingYouth.program}
                                                        </div>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Youth ID */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            Youth ID
                        </Label>
                        <Input
                            value={youthId}
                            onChange={(e) => setYouthId(e.target.value)}
                            className="rounded-md"
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                            placeholder="Enter youth ID"
                        />
                    </div>

                    {/* Age */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            Age
                        </Label>
                        <Input
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="rounded-md"
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                            placeholder="Enter age"
                        />
                    </div>

                    {/* Status - Select dropdown */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            Status
                        </Label>
                        <Popover open={statusComboOpen} onOpenChange={setStatusComboOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm text-left"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        color: status ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)'
                                    }}
                                >
                                    <span className="truncate">{status || "Select status..."}</span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[460px] p-0" align="start">
                                <div className="py-1">
                                    {STATUS_OPTIONS.map((statusOption) => (
                                        <button
                                            key={statusOption}
                                            type="button"
                                            className="w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-50"
                                            onClick={() => {
                                                setStatus(statusOption);
                                                setStatusComboOpen(false);
                                            }}
                                        >
                                            <Check 
                                                className={`mr-2 h-4 w-4 ${status === statusOption ? 'opacity-100' : 'opacity-0'}`}
                                            />
                                            {statusOption}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Program - Select dropdown */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
                            Program
                        </Label>
                        <Popover open={programComboOpen} onOpenChange={setProgramComboOpen}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm text-left"
                                    style={{
                                        border: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        color: program ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)'
                                    }}
                                >
                                    <span className="truncate">{program || "Select program..."}</span>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[460px] p-0" align="start">
                                <div className="py-1">
                                    {['Mahoney House', 'Rydell House', 'Walsh Campus'].map((programOption) => (
                                        <button
                                            key={programOption}
                                            type="button"
                                            className="w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-50"
                                            onClick={() => {
                                                setProgram(programOption);
                                                setProgramComboOpen(false);
                                            }}
                                        >
                                            <Check 
                                                className={`mr-2 h-4 w-4 ${program === programOption ? 'opacity-100' : 'opacity-0'}`}
                                            />
                                            {programOption}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-full"
                        style={{
                            border: '1px solid var(--slds-g-color-border-base-1)'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={!isValid}
                        className="rounded-full"
                        style={{
                            backgroundColor: isValid ? 'var(--color-brand-primary)' : 'var(--slds-g-color-neutral-base-60)',
                            color: 'white',
                            border: 'none',
                            opacity: isValid ? 1 : 0.6,
                            cursor: isValid ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {youth ? 'Save Changes' : 'Add Youth'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}