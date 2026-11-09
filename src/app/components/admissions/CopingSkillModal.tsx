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

export interface CopingSkillData {
    dateReported: string;
    lastITPInclusion: string;
    copingSkill: string;
    description: string;
    effectiveWhen: string;
}

interface CopingSkillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CopingSkillData) => void;
    initialData?: Partial<CopingSkillData>;
    title?: string;
}

const emptyState: CopingSkillData = {
    dateReported: "",
    lastITPInclusion: "",
    copingSkill: "",
    description: "",
    effectiveWhen: ""
};

export function CopingSkillModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    title = "Add New Coping Skill"
}: CopingSkillModalProps) {
    const [formData, setFormData] = useState<CopingSkillData>(emptyState);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                dateReported: initialData?.dateReported || "",
                lastITPInclusion: initialData?.lastITPInclusion || "",
                copingSkill: initialData?.copingSkill || "",
                description: initialData?.description || "",
                effectiveWhen: initialData?.effectiveWhen || ""
            });
        }
    }, [isOpen, initialData]);

    const handleSave = () => {
        if (!formData.dateReported || !formData.copingSkill) return;
        onSave(formData);
        onClose();
    };

    const isEdit = Boolean(initialData && (initialData.copingSkill || initialData.dateReported));

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent
                className="sm:max-w-[720px] rounded-[8px] bg-white border border-[#dddbda] max-h-[90vh] overflow-hidden flex flex-col p-0"
                aria-describedby={undefined}
            >
                <DialogHeader className="border-b border-[#dddbda] pb-4 px-6 pt-6 mb-0">
                    <DialogTitle className="text-[16px] font-bold text-[#080707]">{title}</DialogTitle>
                    <DialogDescription className="sr-only">Enter coping skill details.</DialogDescription>
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
                                Coping Skill <span className="text-red-600">*</span>
                            </Label>
                            <Input
                                value={formData.copingSkill}
                                onChange={(e) => setFormData((p) => ({ ...p, copingSkill: e.target.value }))}
                                className="h-9 slds-text-4"
                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                placeholder="Enter coping skill"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="slds-form-label" style={{ color: 'var(--slds-g-color-text-weak)' }}>Effective When</Label>
                            <Input
                                value={formData.effectiveWhen}
                                onChange={(e) => setFormData((p) => ({ ...p, effectiveWhen: e.target.value }))}
                                className="h-9 slds-text-4"
                                style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                                placeholder="When is this effective?"
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
                        disabled={!formData.dateReported || !formData.copingSkill}
                        className="h-9 px-4 rounded-full slds-text-4 font-medium text-white"
                        style={{ backgroundColor: '#145F33' }}
                    >
                        {isEdit ? 'Update Coping Skill' : 'Add Coping Skill'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
