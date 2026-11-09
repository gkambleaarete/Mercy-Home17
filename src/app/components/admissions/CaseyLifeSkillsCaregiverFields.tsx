import { useRef } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Upload, File, Trash2 } from "@/app/lib/lucide-icons";

interface CaseyLifeSkillsCaregiverFieldsProps {
    formData: {
        dailyLiving: string;
        selfCare: string;
        relationshipsCommunication: string;
        housingMoneyManagement: string;
        workStudyLife: string;
        careerEducation: string;
        civicEngagement: string;
        navigatingChildWelfare: string;
        lookingForward: string;
        commentary: string;
    };
    onFormDataChange: (data: any) => void;
    formErrors: Record<string, string>;
    documents: Array<{ id: string; name: string; size: number; uploadedDate: string }>;
    onFileChange: (files: FileList | null) => void;
    onRemoveDocument: (id: string) => void;
}

export function CaseyLifeSkillsCaregiverFields({
    formData,
    onFormDataChange,
    formErrors,
    documents,
    onFileChange,
    onRemoveDocument
}: CaseyLifeSkillsCaregiverFieldsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleScoreChange = (field: string, value: string) => {
        // Allow empty string or valid decimal numbers
        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
            onFormDataChange({ ...formData, [field]: value });
        }
    };

    const validateScore = (value: string): string | null => {
        if (value === '') return null; // Optional field
        const num = parseFloat(value);
        if (isNaN(num) || num < 0 || num > 5) {
            return "Please enter a value from 0.00–5.00";
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Score Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Living */}
                <div>
                    <Label htmlFor="casey-daily-living" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        Daily Living
                    </Label>
                    <Input
                        id="casey-daily-living"
                        type="text"
                        maxLength={4}
                        value={formData.dailyLiving}
                        onChange={(e) => handleScoreChange('dailyLiving', e.target.value)}
                        onBlur={(e) => {
                            const error = validateScore(e.target.value);
                            if (error) {
                                onFormDataChange({ ...formData, dailyLiving: '' });
                            }
                        }}
                        placeholder="0.00-5.00"
                        className="h-9 text-[13px] rounded"
                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                    />
                    {formErrors.dailyLiving && (
                        <p className="text-[12px] text-red-600 mt-1">{formErrors.dailyLiving}</p>
                    )}
                </div>

                {/* Self-Care */}
                <div>
                    <Label htmlFor="casey-self-care" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        Self-Care
                    </Label>
                    <Input
                        id="casey-self-care"
                        type="text"
                        maxLength={4}
                        value={formData.selfCare}
                        onChange={(e) => handleScoreChange('selfCare', e.target.value)}
                        onBlur={(e) => {
                            const error = validateScore(e.target.value);
                            if (error) {
                                onFormDataChange({ ...formData, selfCare: '' });
                            }
                        }}
                        placeholder="0.00-5.00"
                        className="h-9 text-[13px] rounded"
                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                    />
                    {formErrors.selfCare && (
                        <p className="text-[12px] text-red-600 mt-1">{formErrors.selfCare}</p>
                    )}
                </div>

                {/* Relationships and Communication */}
                <div>
                    <Label htmlFor="casey-relationships" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        Relationships and Communication
                    </Label>
                    <Input
                        id="casey-relationships"
                        type="text"
                        maxLength={4}
                        value={formData.relationshipsCommunication}
                        onChange={(e) => handleScoreChange('relationshipsCommunication', e.target.value)}
                        onBlur={(e) => {
                            const error = validateScore(e.target.value);
                            if (error) {
                                onFormDataChange({ ...formData, relationshipsCommunication: '' });
                            }
                        }}
                        placeholder="0.00-5.00"
                        className="h-9 text-[13px] rounded"
                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                    />
                    {formErrors.relationshipsCommunication && (
                        <p className="text-[12px] text-red-600 mt-1">{formErrors.relationshipsCommunication}</p>
                    )}
                </div>

                {/* Housing, Money Management & Transportation */}
                <div>
                    <Label htmlFor="casey-housing" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        Housing, Money Management & Transportation
                    </Label>
                    <Input
                        id="casey-housing"
                        type="text"
                        maxLength={4}
                        value={formData.housingMoneyManagement}
                        onChange={(e) => handleScoreChange('housingMoneyManagement', e.target.value)}
                        onBlur={(e) => {
                            const error = validateScore(e.target.value);
                            if (error) {
                                onFormDataChange({ ...formData, housingMoneyManagement: '' });
                            }
                        }}
                        placeholder="0.00-5.00"
                        className="h-9 text-[13px] rounded"
                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                    />
                    {formErrors.housingMoneyManagement && (
                        <p className="text-[12px] text-red-600 mt-1">{formErrors.housingMoneyManagement}</p>
                    )}
                </div>

                {/* Work and Study Life */}
                <div>
                    <Label htmlFor="casey-work-study" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        Work and Study Life
                    </Label>
                    <Input
                        id="casey-work-study"
                        type="text"
                        maxLength={4}
                        value={formData.workStudyLife}
                        onChange={(e) => handleScoreChange('workStudyLife', e.target.value)}
                        onBlur={(e) => {
                            const error = validateScore(e.target.value);
                            if (error) {
                                onFormDataChange({ ...formData, workStudyLife: '' });
                            }
                        }}
                        placeholder="0.00-5.00"
                        className="h-9 text-[13px] rounded"
                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                    />
                    {formErrors.workStudyLife && (
                        <p className="text-[12px] text-red-600 mt-1">{formErrors.workStudyLife}</p>
                    )}
                </div>

                {/* Career and Education Planning */}
                <div>
                    <Label htmlFor="casey-career" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        Career and Education Planning
                    </Label>
                    <Input
                        id="casey-career"
                        type="text"
                        maxLength={4}
                        value={formData.careerEducation}
                        onChange={(e) => handleScoreChange('careerEducation', e.target.value)}
                        onBlur={(e) => {
                            const error = validateScore(e.target.value);
                            if (error) {
                                onFormDataChange({ ...formData, careerEducation: '' });
                            }
                        }}
                        placeholder="0.00-5.00"
                        className="h-9 text-[13px] rounded"
                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                    />
                    {formErrors.careerEducation && (
                        <p className="text-[12px] text-red-600 mt-1">{formErrors.careerEducation}</p>
                    )}
                </div>

                {/* Civic Engagement */}
                <div>
                    <Label htmlFor="casey-civic" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        Civic Engagement
                    </Label>
                    <Input
                        id="casey-civic"
                        type="text"
                        maxLength={4}
                        value={formData.civicEngagement}
                        onChange={(e) => handleScoreChange('civicEngagement', e.target.value)}
                        onBlur={(e) => {
                            const error = validateScore(e.target.value);
                            if (error) {
                                onFormDataChange({ ...formData, civicEngagement: '' });
                            }
                        }}
                        placeholder="0.00-5.00"
                        className="h-9 text-[13px] rounded"
                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                    />
                    {formErrors.civicEngagement && (
                        <p className="text-[12px] text-red-600 mt-1">{formErrors.civicEngagement}</p>
                    )}
                </div>

                {/* Navigating the Child Welfare System */}
                <div>
                    <Label htmlFor="casey-welfare" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        Navigating the Child Welfare System
                    </Label>
                    <Input
                        id="casey-welfare"
                        type="text"
                        maxLength={4}
                        value={formData.navigatingChildWelfare}
                        onChange={(e) => handleScoreChange('navigatingChildWelfare', e.target.value)}
                        onBlur={(e) => {
                            const error = validateScore(e.target.value);
                            if (error) {
                                onFormDataChange({ ...formData, navigatingChildWelfare: '' });
                            }
                        }}
                        placeholder="0.00-5.00"
                        className="h-9 text-[13px] rounded"
                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                    />
                    {formErrors.navigatingChildWelfare && (
                        <p className="text-[12px] text-red-600 mt-1">{formErrors.navigatingChildWelfare}</p>
                    )}
                </div>

                {/* Looking Forward */}
                <div>
                    <Label htmlFor="casey-looking-forward" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        Looking Forward
                    </Label>
                    <Input
                        id="casey-looking-forward"
                        type="text"
                        maxLength={4}
                        value={formData.lookingForward}
                        onChange={(e) => handleScoreChange('lookingForward', e.target.value)}
                        onBlur={(e) => {
                            const error = validateScore(e.target.value);
                            if (error) {
                                onFormDataChange({ ...formData, lookingForward: '' });
                            }
                        }}
                        placeholder="0.00-5.00"
                        className="h-9 text-[13px] rounded"
                        style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                    />
                    {formErrors.lookingForward && (
                        <p className="text-[12px] text-red-600 mt-1">{formErrors.lookingForward}</p>
                    )}
                </div>
            </div>

            {/* Commentary */}
            <div>
                <Label htmlFor="casey-commentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Commentary
                </Label>
                <p className="text-[12px] mb-1.5" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Provide details on the Youth's highest and lowest ranked Categories.
                </p>
                <Textarea
                    id="casey-commentary"
                    value={formData.commentary}
                    onChange={(e) => onFormDataChange({ ...formData, commentary: e.target.value })}
                    placeholder="Enter commentary..."
                    className="text-[13px] rounded min-h-[100px]"
                    style={{ backgroundColor: 'var(--slds-g-color-background-base)', border: '1px solid var(--slds-g-color-border-base-1)', color: 'var(--slds-g-color-text-default)' }}
                />
            </div>

            {/* Document Upload */}
            <div>
                <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Document
                </Label>
                <div
                    className="border-2 border-dashed rounded p-6 text-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                    style={{ borderColor: 'var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-alt)' }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="mx-auto h-8 w-8 mb-2" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                    <p className="text-[13px] mb-2" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Drag and drop test report here, or click to browse
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        className="h-8 px-4 rounded-full text-[12px]"
                        style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)' }}
                    >
                        Choose File
                    </Button>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    multiple
                    onChange={(e) => onFileChange(e.target.files)}
                    style={{ display: 'none' }}
                />

                {documents.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <Label className="block text-[12px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            Uploaded Documents ({documents.length})
                        </Label>
                        <div 
                            className="border rounded overflow-hidden"
                            style={{ 
                                borderColor: 'var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            {documents.map((doc, index) => (
                                <div 
                                    key={doc.id} 
                                    className="flex items-center justify-between p-3 hover:bg-gray-50/50"
                                    style={{ 
                                        borderBottom: index < documents.length - 1 ? '1px solid var(--slds-g-color-border-base-1)' : 'none'
                                    }}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <File className="h-5 w-5" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-medium truncate" style={{ color: 'var(--slds-g-color-text-default)' }}>
                                                {doc.name}
                                            </p>
                                            <p className="text-[12px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                                {(doc.size / 1024).toFixed(0)} KB • {doc.uploadedDate}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemoveDocument(doc.id)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Trash2 className="h-4 w-4" style={{ color: '#c23934' }} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
