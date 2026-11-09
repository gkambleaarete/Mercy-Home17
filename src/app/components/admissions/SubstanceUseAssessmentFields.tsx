import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

// Reason for Request options (for Integrated Substance Use Assessment)
const reasonForRequestOptions = [
    "Possession of Drugs, Paraphernalia, or Alcohol",
    "Positive Toxicology Test",
    "History of Drug/Alcohol Abuse",
    "Pattern of Drug/Alcohol Use",
    "Other",
];

interface SubstanceUseAssessmentFieldsProps {
    connectionDetails: {
        reasonForRequest?: string[];
        reasonForRequestOther?: string;
        results?: string;
        recommendations?: string;
    };
    setConnectionDetails: (details: any) => void;
}

export function SubstanceUseAssessmentFields({ connectionDetails, setConnectionDetails }: SubstanceUseAssessmentFieldsProps) {
    return (
        <div className="space-y-6">
            {/* Reason for Request (Multi-select) */}
            <div className="grid gap-2">
                <Label className="text-[13px] text-[#3e3e3c] font-medium">Reason for Request</Label>
                <div className="space-y-2">
                    {reasonForRequestOptions.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                id={`reason-${option}`} 
                                checked={connectionDetails.reasonForRequest?.includes(option) || false} 
                                onChange={(e) => { 
                                    const currentReasons = connectionDetails.reasonForRequest || []; 
                                    if (e.target.checked) { 
                                        setConnectionDetails({ 
                                            ...connectionDetails, 
                                            reasonForRequest: [...currentReasons, option] 
                                        }); 
                                    } else { 
                                        setConnectionDetails({ 
                                            ...connectionDetails, 
                                            reasonForRequest: currentReasons.filter(r => r !== option),
                                            reasonForRequestOther: option === "Other" ? "" : connectionDetails.reasonForRequestOther
                                        }); 
                                    } 
                                }} 
                                className="h-4 w-4 rounded border-[#dddbda] text-[#145F33] focus:ring-[#145F33]" 
                                style={{ colorScheme: 'light', accentColor: '#145F33' }} 
                            />
                            <Label htmlFor={`reason-${option}`} className="text-[13px] text-[#3e3e3c] cursor-pointer">
                                {option}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Other Reason Details (Required if "Other" is selected) */}
            {connectionDetails.reasonForRequest?.includes("Other") && (
                <div className="grid gap-2">
                    <Label className="text-[13px] text-[#3e3e3c] font-medium">
                        Specify Other Reason <span className="text-red-600">*</span>
                    </Label>
                    <Textarea 
                        value={connectionDetails.reasonForRequestOther || ""} 
                        onChange={(e) => setConnectionDetails({ ...connectionDetails, reasonForRequestOther: e.target.value })} 
                        placeholder="Enter other reason details..." 
                        className="min-h-[100px] text-[13px] border-[#dddbda] resize-none" 
                        style={{ fontFamily: 'inherit' }} 
                    />
                </div>
            )}

            {/* Results */}
            <div className="grid gap-2">
                <Label className="text-[13px] text-[#3e3e3c] font-medium">Results</Label>
                <Textarea 
                    value={connectionDetails.results || ""} 
                    onChange={(e) => setConnectionDetails({ ...connectionDetails, results: e.target.value })} 
                    placeholder="Enter assessment results..." 
                    className="min-h-[120px] text-[13px] border-[#dddbda] resize-none" 
                    style={{ fontFamily: 'inherit' }} 
                />
            </div>

            {/* Recommendations */}
            <div className="grid gap-2">
                <Label className="text-[13px] text-[#3e3e3c] font-medium">Recommendations</Label>
                <Textarea 
                    value={connectionDetails.recommendations || ""} 
                    onChange={(e) => setConnectionDetails({ ...connectionDetails, recommendations: e.target.value })} 
                    placeholder="Enter recommendations..." 
                    className="min-h-[120px] text-[13px] border-[#dddbda] resize-none" 
                    style={{ fontFamily: 'inherit' }} 
                />
            </div>
        </div>
    );
}
