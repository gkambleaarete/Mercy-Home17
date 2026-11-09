import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { File, Trash2, Upload } from "@/app/lib/lucide-icons";
import { useState, useRef } from "react";

interface CaseyLifeSkillsYouthFieldsProps {
    formData: {
        examiner: string;
        programScoresId: string;
        guardianScoresId: string;
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
    documents: Array<{
        id: string;
        name: string;
        size: number;
        uploadedDate: string;
    }>;
    onFileChange: (files: FileList | null) => void;
    onRemoveDocument: (id: string) => void;
    availableCaregiverTests: Array<{
        id: number;
        date: string;
        test: string;
        raterType: string;
        rater: string;
        caseyLifeSkillsData?: {
            dailyLiving: string;
            selfCare: string;
            relationshipsCommunication: string;
            housingMoneyManagement: string;
            workStudyLife: string;
            careerEducation: string;
            civicEngagement: string;
            navigatingChildWelfare: string;
            lookingForward: string;
        };
    }>;
}

export function CaseyLifeSkillsYouthFields({
    formData,
    onFormDataChange,
    formErrors,
    documents,
    onFileChange,
    onRemoveDocument,
    availableCaregiverTests
}: CaseyLifeSkillsYouthFieldsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    // Get linked program and guardian test data
    const programTest = availableCaregiverTests.find(t => t.id === parseInt(formData.programScoresId));
    const guardianTest = availableCaregiverTests.find(t => t.id === parseInt(formData.guardianScoresId));

    // Determine how many columns to show (1-3)
    const showProgramColumn = !!programTest;
    const showGuardianColumn = !!guardianTest;
    const columnCount = 1 + (showProgramColumn ? 1 : 0) + (showGuardianColumn ? 1 : 0);

    // Filter caregiver tests by rater type
    const programTests = availableCaregiverTests.filter(t => 
        t.raterType === "Therapist" || t.raterType === "Advocate"
    );
    const guardianTests = availableCaregiverTests.filter(t => 
        t.raterType === "Parent/Guardian"
    );

    const handleScoreChange = (field: string, value: string) => {
        // Allow empty or valid decimal format
        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
            onFormDataChange({ ...formData, [field]: value });
        }
    };

    const handleScoreBlur = (field: string, value: string) => {
        if (value === '') return;
        const num = parseFloat(value);
        if (isNaN(num) || num < 0 || num > 5) {
            onFormDataChange({ ...formData, [field]: '' });
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileChange(e.dataTransfer.files);
        }
    };

    const scoreFields = [
        { key: 'dailyLiving', label: 'Daily Living' },
        { key: 'selfCare', label: 'Self-Care' },
        { key: 'relationshipsCommunication', label: 'Relationships and Communication' },
        { key: 'housingMoneyManagement', label: 'Housing, Money Management & Transportation' },
        { key: 'workStudyLife', label: 'Work and Study Life' },
        { key: 'careerEducation', label: 'Career and Education Planning' },
        { key: 'civicEngagement', label: 'Civic Engagement' },
        { key: 'navigatingChildWelfare', label: 'Navigating the Child Welfare System' },
        { key: 'lookingForward', label: 'Looking Forward' }
    ];

    return (
        <div className="space-y-6">
            {/* Examiner Field */}
            <div>
                <Label htmlFor="examiner" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Examiner
                </Label>
                <Input
                    id="examiner"
                    type="text"
                    value={formData.examiner}
                    onChange={(e) => onFormDataChange({ ...formData, examiner: e.target.value })}
                    placeholder="Enter examiner name"
                    className="h-9 text-[13px] rounded"
                    style={{
                        borderColor: 'var(--slds-g-color-border-base-1)',
                        backgroundColor: 'var(--slds-g-color-background-base)'
                    }}
                />
            </div>

            {/* Linking/Unlinking Caregiver Assessments Section */}
            <div className="space-y-4 p-4 rounded" style={{ backgroundColor: 'var(--slds-g-color-neutral-95)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                <h3 className="text-[13px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Link Caregiver Assessments
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Program Scores */}
                    <div>
                        <Label htmlFor="program-scores" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            Program Scores
                        </Label>
                        <div className="flex gap-2">
                            <select
                                id="program-scores"
                                value={formData.programScoresId}
                                onChange={(e) => onFormDataChange({ ...formData, programScoresId: e.target.value })}
                                className="flex-1 h-9 text-[13px] rounded px-3"
                                style={{
                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    color: formData.programScoresId ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)'
                                }}
                            >
                                <option value="">Select Program Assessment</option>
                                {programTests.map(test => (
                                    <option key={test.id} value={test.id}>
                                        {test.date} - {test.raterType} - {test.rater}
                                    </option>
                                ))}
                            </select>
                            {formData.programScoresId && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onFormDataChange({ ...formData, programScoresId: '' })}
                                    className="h-9 w-9 p-0"
                                >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Guardian Scores */}
                    <div>
                        <Label htmlFor="guardian-scores" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            Guardian Scores
                        </Label>
                        <div className="flex gap-2">
                            <select
                                id="guardian-scores"
                                value={formData.guardianScoresId}
                                onChange={(e) => onFormDataChange({ ...formData, guardianScoresId: e.target.value })}
                                className="flex-1 h-9 text-[13px] rounded px-3"
                                style={{
                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    color: formData.guardianScoresId ? 'var(--slds-g-color-text-default)' : 'var(--slds-g-color-text-weak)'
                                }}
                            >
                                <option value="">Select Guardian Assessment</option>
                                {guardianTests.map(test => (
                                    <option key={test.id} value={test.id}>
                                        {test.date} - {test.raterType} - {test.rater}
                                    </option>
                                ))}
                            </select>
                            {formData.guardianScoresId && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onFormDataChange({ ...formData, guardianScoresId: '' })}
                                    className="h-9 w-9 p-0"
                                >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Score Comparison View */}
            <div className="space-y-4">
                <h3 className="text-[13px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>
                    Casey Life Skills Scores
                </h3>

                {/* Header Row - Only show columns that are active */}
                <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
                    {/* Youth Column Header */}
                    <div className="space-y-2 p-3 rounded" style={{ backgroundColor: 'var(--slds-g-color-brand-10)', border: '2px solid #145F33' }}>
                        <div className="text-[11px] font-semibold uppercase" style={{ color: '#145F33' }}>Youth Scores</div>
                        <div className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>Editable</div>
                    </div>

                    {/* Program Column Header */}
                    {showProgramColumn && programTest && (
                        <div className="space-y-2 p-3 rounded" style={{ backgroundColor: 'var(--slds-g-color-neutral-95)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <div className="text-[11px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>Program Scores</div>
                            <div className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                {programTest.date} • {programTest.raterType} • {programTest.rater}
                            </div>
                        </div>
                    )}

                    {/* Guardian Column Header */}
                    {showGuardianColumn && guardianTest && (
                        <div className="space-y-2 p-3 rounded" style={{ backgroundColor: 'var(--slds-g-color-neutral-95)', border: '1px solid var(--slds-g-color-border-base-1)' }}>
                            <div className="text-[11px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-default)' }}>Guardian Scores</div>
                            <div className="text-[11px]" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                                {guardianTest.date} • {guardianTest.raterType} • {guardianTest.rater}
                            </div>
                        </div>
                    )}
                </div>

                {/* Score Fields */}
                {scoreFields.map((field) => (
                    <div key={field.key}>
                        <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            {field.label}
                        </Label>
                        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
                            {/* Youth Score - Editable */}
                            <div>
                                <Input
                                    type="text"
                                    value={formData[field.key as keyof typeof formData] as string}
                                    onChange={(e) => handleScoreChange(field.key, e.target.value)}
                                    onBlur={(e) => handleScoreBlur(field.key, e.target.value)}
                                    placeholder="0.00 - 5.00"
                                    className="h-9 text-[13px] rounded"
                                    style={{
                                        borderColor: formErrors[field.key] ? '#c23934' : 'var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                    }}
                                />
                                {formErrors[field.key] && (
                                    <p className="text-[11px] mt-1" style={{ color: '#c23934' }}>
                                        {formErrors[field.key]}
                                    </p>
                                )}
                            </div>

                            {/* Program Score - Read-only */}
                            {showProgramColumn && (
                                <div className="h-9 flex items-center px-3 rounded text-[13px]" style={{ 
                                    backgroundColor: 'var(--slds-g-color-neutral-95)', 
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    color: 'var(--slds-g-color-text-default)'
                                }}>
                                    {programTest?.caseyLifeSkillsData?.[field.key as keyof typeof programTest.caseyLifeSkillsData] || 'N/A'}
                                </div>
                            )}

                            {/* Guardian Score - Read-only */}
                            {showGuardianColumn && (
                                <div className="h-9 flex items-center px-3 rounded text-[13px]" style={{ 
                                    backgroundColor: 'var(--slds-g-color-neutral-95)', 
                                    border: '1px solid var(--slds-g-color-border-base-1)',
                                    color: 'var(--slds-g-color-text-default)'
                                }}>
                                    {guardianTest?.caseyLifeSkillsData?.[field.key as keyof typeof guardianTest.caseyLifeSkillsData] || 'N/A'}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Commentary */}
            <div>
                <Label htmlFor="commentary" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Commentary
                </Label>
                <p className="text-[11px] mb-2" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Provide details on the Youth's highest and lowest ranked Categories.
                </p>
                <Textarea
                    id="commentary"
                    value={formData.commentary}
                    onChange={(e) => onFormDataChange({ ...formData, commentary: e.target.value })}
                    rows={4}
                    className="text-[13px] rounded resize-none"
                    style={{
                        borderColor: 'var(--slds-g-color-border-base-1)',
                        backgroundColor: 'var(--slds-g-color-background-base)'
                    }}
                />
            </div>

            {/* Document Upload */}
            <div>
                <Label className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                    Documents
                </Label>
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive ? 'border-[#145F33] bg-[#145F33]/5' : ''
                    }`}
                    style={{
                        borderColor: dragActive ? '#145F33' : 'var(--slds-g-color-border-base-1)',
                        backgroundColor: dragActive ? 'rgba(20, 95, 51, 0.05)' : 'var(--slds-g-color-background-base)'
                    }}
                >
                    <Upload className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--slds-g-color-text-weak)' }} />
                    <p className="text-[13px] mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>
                        Drag and drop files here, or click to browse
                    </p>
                    <p className="text-[11px] mb-3" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                        Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-9 px-4 rounded-full text-[13px] font-medium"
                        style={{
                            borderColor: '#145F33',
                            color: '#145F33'
                        }}
                    >
                        Select Files
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => onFileChange(e.target.files)}
                        style={{ display: 'none' }}
                    />
                </div>

                {documents.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <Label className="block text-[12px] font-semibold uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                            Uploaded Documents ({documents.length})
                        </Label>
                        <div className="border rounded overflow-hidden" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
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
                                        className="h-8 w-8 p-0 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-600" />
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
