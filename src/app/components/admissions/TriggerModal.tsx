import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { DateInput } from '../ui/date-input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '../ui/dialog';

export interface TriggerData {
    dateReported: string;
    lastITPInclusion: string;
    trigger: string;
    endDate: string;
    description: string;
}

interface TriggerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: TriggerData) => void;
    initialData?: Partial<TriggerData>;
    title?: string;
}

const emptyState: TriggerData = {
    dateReported: "",
    lastITPInclusion: "",
    trigger: "",
    endDate: "",
    description: ""
};

export function TriggerModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    title = "Add New Trigger"
}: TriggerModalProps) {
    const [formData, setFormData] = useState<TriggerData>(emptyState);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                dateReported: initialData?.dateReported || "",
                lastITPInclusion: initialData?.lastITPInclusion || "",
                trigger: initialData?.trigger || "",
                endDate: initialData?.endDate || "",
                description: initialData?.description || ""
            });
        }
    }, [isOpen, initialData]);

    const handleSave = () => {
        if (!formData.dateReported || !formData.trigger) return;
        onSave(formData);
        onClose();
    };

    const isEdit = Boolean(initialData && (initialData.trigger || initialData.dateReported));

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent
                className="sm:max-w-[720px] rounded-[8px] bg-white border border-[#dddbda] max-h-[90vh] overflow-hidden flex flex-col p-0"
                aria-describedby={undefined}
            >
                <DialogHeader className="border-b border-[#dddbda] pb-4 px-6 pt-6 mb-0">
                    <DialogTitle className="text-[16px] font-bold text-[#080707]">{title}</DialogTitle>
                    <DialogDescription className="sr-only">Enter trigger details.</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                Date Reported <span className="text-red-600">*</span>
                            </Label>
                            <DateInput
                                value={formData.dateReported}
                                onChange={(v) => setFormData((p) => ({ ...p, dateReported: v }))}
                                className="h-9 slds-text-4"
                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Last ITP Inclusion</Label>
                            <DateInput
                                value={formData.lastITPInclusion}
                                onChange={(v) => setFormData((p) => ({ ...p, lastITPInclusion: v }))}
                                className="h-9 slds-text-4"
                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                Trigger <span className="text-red-600">*</span>
                            </Label>
                            <Input
                                value={formData.trigger}
                                onChange={(e) => setFormData((p) => ({ ...p, trigger: e.target.value }))}
                                className="h-9 slds-text-4"
                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                placeholder="Enter trigger"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>End Date</Label>
                            <DateInput
                                value={formData.endDate}
                                onChange={(v) => setFormData((p) => ({ ...p, endDate: v }))}
                                className="h-9 slds-text-4"
                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                            className="slds-text-4 min-h-[80px] resize-none"
                            style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                            placeholder="Enter detailed description"
                        />
                    </div>
                </div>

                <DialogFooter className="border-t border-[#dddbda] px-6 py-4 gap-2">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="h-9 px-4 rounded-full slds-text-4 font-medium"
                        style={{
                            backgroundColor: 'var(--slds-g-color-neutral-95)',
                            color: 'var(--slds-g-color-text-default)',
                            border: '1px solid var(--slds-g-color-border-base-1)'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        disabled={!formData.dateReported || !formData.trigger}
                        className="h-9 px-4 rounded-full slds-text-4 font-medium text-white"
                        style={{ backgroundColor: '#145F33' }}
                    >
                        {isEdit ? 'Update Trigger' : 'Add Trigger'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
