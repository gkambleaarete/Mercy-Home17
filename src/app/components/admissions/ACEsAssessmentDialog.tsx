import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface ACEsQuestion {
    id: string;
    question: string;
    answer: "Yes" | "No" | null;
}

export interface ACEsAssessmentData {
    id: number;
    date: string;
    test: string;
    raterType: string;
    rater: string;
    examiner: string;
    questions: ACEsQuestion[];
    totalAces: number;
    comments: string;
}

interface ACEsAssessmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: Omit<ACEsAssessmentData, "id" | "totalAces">) => void;
    editingData?: ACEsAssessmentData | null;
    youthName?: string;
}

const DEFAULT_QUESTIONS: ACEsQuestion[] = [
    {
        id: "q1",
        question: "Did a parent or other adult in the household often or very often swear at you, insult you, put you down, or humiliate you?",
        answer: null
    },
    {
        id: "q2",
        question: "Did a parent or other adult in the household often or very often hit, kick, beat, or physically hurt you in any way?",
        answer: null
    },
    {
        id: "q3",
        question: "Did an adult or person over 5 years older than you ever touch you sexually, try to make you touch them sexually or force you to have sex?",
        answer: null
    },
    {
        id: "q4",
        question: "Did you often or very often feel that no adult in your household made feel safe and protected?",
        answer: null
    },
    {
        id: "q5",
        question: "Did you often or very often feel that no adult in your household made sure your basic needs were met?",
        answer: null
    },
    {
        id: "q6",
        question: "Were your parents ever separated or divorced?",
        answer: null
    },
    {
        id: "q7",
        question: "Did your parents or other adults in your home slap, hit, kick, punch, or beat each other up?",
        answer: null
    },
    {
        id: "q8",
        question: "Did you live with anyone who was a problem drinker or alcoholic, used illegal street drugs, or abused prescription medications?",
        answer: null
    },
    {
        id: "q9",
        question: "Did you live with anyone who was depressed, mentally ill, or suicidal?",
        answer: null
    },
    {
        id: "q10",
        question: "Did you live with anyone who served time or was sentenced to serve time in a prison, jail, or other correctional facility?",
        answer: null
    }
];

export function ACEsAssessmentDialog({ 
    open, 
    onOpenChange, 
    onSave, 
    editingData,
    youthName = "Current Youth"
}: ACEsAssessmentDialogProps) {
    const [formData, setFormData] = useState({
        date: "",
        test: "ACEs",
        raterType: "Youth",
        rater: youthName,
        examiner: "",
        questions: DEFAULT_QUESTIONS,
        comments: ""
    });

    useEffect(() => {
        if (editingData) {
            setFormData({
                date: editingData.date,
                test: editingData.test,
                raterType: editingData.raterType,
                rater: editingData.rater,
                examiner: editingData.examiner,
                questions: editingData.questions,
                comments: editingData.comments
            });
        } else {
            setFormData({
                date: "",
                test: "ACEs",
                raterType: "Youth",
                rater: youthName,
                examiner: "",
                questions: DEFAULT_QUESTIONS,
                comments: ""
            });
        }
    }, [editingData, youthName, open]);

    const handleQuestionChange = (questionId: string, value: "Yes" | "No" | null) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map(q => 
                q.id === questionId ? { ...q, answer: value } : q
            )
        }));
    };

    const calculateTotalAces = () => {
        return formData.questions.filter(q => q.answer === "Yes").length;
    };

    const handleSave = () => {
        if (!formData.date) {
            return;
        }
        onSave(formData);
        onOpenChange(false);
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="sm:max-w-3xl max-h-[90vh] overflow-y-auto" 
                style={{ 
                    backgroundColor: 'var(--slds-g-color-background-base)', 
                    border: '1px solid var(--slds-g-color-border-base-1)' 
                }} 
                aria-describedby={undefined}
            >
                <DialogHeader>
                    <DialogTitle 
                        className="text-[16px] font-semibold" 
                        style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                        ACEs Assessment
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Header Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label 
                                className="block text-[13px] font-semibold mb-1.5" 
                                style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                                Date <span className="text-red-600">*</span>
                            </Label>
                            <DateInput
value={isoToMdy(formData.date)}
                                onChange={(v) => ((e) => setFormData({ ...formData, date: e.target.value }))({ target: { value: mdyToIso(v) } })}
                                className="h-9 text-[13px]"
                                style={{
                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                    backgroundColor: 'var(--slds-g-color-background-base)'
                                }}
                                required
                            />
                        </div>
                        <div>
                            <Label 
                                className="block text-[13px] font-semibold mb-1.5" 
                                style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                                Test
                            </Label>
                            <Select
                                value={formData.test}
                                onValueChange={(value) => setFormData({ ...formData, test: value })}
                            >
                                <SelectTrigger 
                                    className="h-9 text-[13px]"
                                    style={{
                                        borderColor: 'var(--slds-g-color-border-base-1)',
                                        backgroundColor: 'var(--slds-g-color-background-base)'
                                    }}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACEs">ACEs</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* ACEs Questions Section */}
                    <div 
                        className="border-t pt-4"
                        style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                    >
                        <div className="mb-4">
                            <h3 
                                className="text-[13px] font-semibold mb-1" 
                                style={{ color: 'var(--slds-g-color-text-default)' }}
                            >
                                ACEs Assessment
                            </h3>
                            <p 
                                className="text-[13px] italic" 
                                style={{ color: 'var(--slds-g-color-text-weak)' }}
                            >
                                While you were growing up, during your first 18 years of life:
                            </p>
                        </div>

                        <div className="space-y-0">
                            {formData.questions.map((question, index) => (
                                <div 
                                    key={question.id}
                                    className="mb-6 space-y-2.5"
                                >
                                    <Label 
                                        className="block text-[13px] leading-relaxed" 
                                        style={{ color: 'var(--slds-g-color-text-default)' }}
                                    >
                                        <span className="font-semibold">{index + 1}.</span> {question.question}
                                    </Label>
                                    <RadioGroup 
                                        value={question.answer || undefined} 
                                        onValueChange={(value) => 
                                            handleQuestionChange(
                                                question.id, 
                                                value as "Yes" | "No"
                                            )
                                        }
                                        className="flex gap-6 ml-5"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem 
                                                value="Yes" 
                                                id={`${question.id}-yes`}
                                                style={{
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                }}
                                            />
                                            <Label 
                                                htmlFor={`${question.id}-yes`} 
                                                className="text-[13px] cursor-pointer font-normal"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                Yes
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem 
                                                value="No" 
                                                id={`${question.id}-no`}
                                                style={{
                                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                                }}
                                            />
                                            <Label 
                                                htmlFor={`${question.id}-no`} 
                                                className="text-[13px] cursor-pointer font-normal"
                                                style={{ color: 'var(--slds-g-color-text-default)' }}
                                            >
                                                No
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Number of ACEs - Read Only */}
                    <div 
                        className="border-t pt-4"
                        style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}
                    >
                        <Label 
                            className="block text-[13px] font-semibold mb-1.5" 
                            style={{ color: 'var(--slds-g-color-text-default)' }}
                        >
                            Total Number of ACEs
                        </Label>
                        <div 
                            className="h-9 px-3 flex items-center text-[13px] rounded"
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-neutral-95)',
                                color: 'var(--slds-g-color-text-default)'
                            }}
                        >
                            {calculateTotalAces()}
                        </div>
                    </div>

                    {/* Comments */}
                    <div>
                        <Label 
                            className="block text-[13px] font-semibold mb-1.5" 
                            style={{ color: 'var(--slds-g-color-text-default)' }}
                        >
                            Comments
                        </Label>
                        <Textarea
                            value={formData.comments}
                            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                            className="text-[13px] rounded min-h-[100px]"
                            style={{
                                backgroundColor: 'var(--slds-g-color-background-base)',
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                color: 'var(--slds-g-color-text-default)'
                            }}
                            placeholder="Enter any additional comments..."
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="h-9 px-6 rounded-full text-[13px] shadow-none"
                        style={{
                            border: '1px solid var(--slds-g-color-border-base-1)',
                            backgroundColor: 'var(--slds-g-color-background-base)'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!formData.date}
                        className="h-9 px-6 rounded-full text-[13px]"
                        style={{ 
                            backgroundColor: '#145F33', 
                            color: 'white',
                            opacity: !formData.date ? 0.5 : 1
                        }}
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}