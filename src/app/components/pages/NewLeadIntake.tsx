import { useState } from "react";
import { ChevronLeft, Check, Info, Calendar as CalendarIcon } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "../../lib/utils";
import { formatMdy } from "../../lib/dateFormat";

// Calendar component for date picking
const Calendar = ({ selected, onSelect }: { selected?: Date; onSelect: (date: Date) => void }) => {
  const [currentMonth, setCurrentMonth] = useState(selected || new Date());
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-8" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const isSelected = selected && 
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear();
    
    days.push(
      <button
        key={day}
        onClick={() => onSelect(date)}
        className={cn(
          "h-8 w-8 rounded text-sm hover:bg-gray-100",
          isSelected && "bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary)]"
        )}
      >
        {day}
      </button>
    );
  }
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          ‹
        </button>
        <div className="font-semibold text-sm">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-1 hover:bg-gray-100 rounded"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
};

interface NewLeadIntakeProps {
  onClose: () => void;
}

const STAGES = [
  { key: 1, name: "Intake", label: "Intake" },
  { key: 2, name: "Info Session", label: "Info Session" },
  { key: 3, name: "Clinical Assessment", label: "Clinical Assessment" },
  { key: 4, name: "Determination", label: "Determination" },
  { key: 5, name: "Move-In", label: "Move-In" }
];

export default function NewLeadIntake({ onClose }: NewLeadIntakeProps) {
  const [currentStage, setCurrentStage] = useState(1);
  
  // Stage 1: Intake
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [intakeNotes, setIntakeNotes] = useState("");
  const [program, setProgram] = useState("");
  
  // Stage 2: Info Session
  const [infoSessionDate, setInfoSessionDate] = useState<Date>();
  const [familyInterestLevel, setFamilyInterestLevel] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  
  // Stage 3: Clinical Assessment
  const [assessmentDate, setAssessmentDate] = useState<Date>();
  const [evaluatingClinician, setEvaluatingClinician] = useState("");
  const [clinicianRecommendation, setClinicianRecommendation] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  
  // Stage 4: Determination
  const [determinationStatus, setDeterminationStatus] = useState("");
  const [decisionDate, setDecisionDate] = useState<Date>();
  const [decidedBy, setDecidedBy] = useState("");
  const [falloutReason, setFalloutReason] = useState("");
  const [determinationNotes, setDeterminationNotes] = useState("");
  
  // Stage 5: Move-In
  const [moveInDate, setMoveInDate] = useState<Date>();
  const [assignedCaseManager, setAssignedCaseManager] = useState("");
  const [assignedClinician, setAssignedClinician] = useState("");
  const [initialProgramGoals, setInitialProgramGoals] = useState("");
  const [roomAssignment, setRoomAssignment] = useState("");

  const formatDate = (date?: Date) => {
    if (!date) return "";
    return formatMdy(date);
  };

  const validateStage1 = () => {
    if (!firstName.trim() || !lastName.trim()) {
      return false;
    }
    if (!dateOfBirth) {
      return false;
    }
    if (!guardianName.trim()) {
      return false;
    }
    if (!referralSource) {
      return false;
    }
    return true;
  };

  const validateStage2 = () => {
    if (!infoSessionDate) {
      return false;
    }
    if (!familyInterestLevel) {
      return false;
    }
    return true;
  };

  const validateStage3 = () => {
    if (!assessmentDate) {
      return false;
    }
    if (!evaluatingClinician.trim()) {
      return false;
    }
    if (!clinicianRecommendation) {
      return false;
    }
    return true;
  };

  const validateStage4 = () => {
    if (!determinationStatus) {
      return false;
    }
    if (!decisionDate) {
      return false;
    }
    if (!decidedBy.trim()) {
      return false;
    }
    if (determinationStatus === "denied" && !falloutReason) {
      return false;
    }
    return true;
  };

  const validateStage5 = () => {
    if (!moveInDate) {
      return false;
    }
    if (!initialProgramGoals.trim()) {
      return false;
    }
    return true;
  };

  const handleNext = () => {
    let isValid = false;
    switch(currentStage) {
      case 1:
        isValid = validateStage1();
        if (isValid) {
          setCurrentStage(2);
        }
        break;
      case 2:
        isValid = validateStage2();
        if (isValid) {
          setCurrentStage(3);
        }
        break;
      case 3:
        isValid = validateStage3();
        if (isValid) {
          setCurrentStage(4);
        }
        break;
      case 4:
        isValid = validateStage4();
        if (isValid) {
          if (determinationStatus === "denied") {
            onClose();
          } else {
            setCurrentStage(5);
          }
        }
        break;
      case 5:
        isValid = validateStage5();
        if (isValid) {
          onClose();
        }
        break;
    }
  };

  const getStageGuidance = () => {
    switch(currentStage) {
      case 1:
        return {
          title: "Intake",
          description: "Capture initial information about the candidate and their guardian. This creates the youth record in the system.",
          keyFields: ["Youth Name", "Date of Birth", "Guardian Info", "Referral Source"]
        };
      case 2:
        return {
          title: "Info Session",
          description: "Record the information session details and assess family interest level.",
          keyFields: ["Session Date", "Family Interest Level", "Session Notes"]
        };
      case 3:
        return {
          title: "Clinical Assessment",
          description: "Document the clinical evaluation and recommendation for program fit.",
          keyFields: ["Assessment Date", "Clinician", "Recommendation"]
        };
      case 4:
        return {
          title: "Determination",
          description: "Make the final admission decision. If denied, capture fallout reason for reporting.",
          keyFields: ["Status", "Decision Date", "Decided By"]
        };
      case 5:
        return {
          title: "Move-In",
          description: "Complete the final move-in details to convert the candidate to an active resident.",
          keyFields: ["Move-In Date", "Case Manager", "Initial Goals"]
        };
      default:
        return { title: "", description: "", keyFields: [] };
    }
  };

  const guidance = getStageGuidance();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with Back Navigation */}
      <div 
        className="flex-shrink-0"
        style={{
          backgroundColor: 'var(--slds-g-color-background-base)',
          borderBottom: '1px solid var(--slds-g-color-border-base-1)'
        }}
      >
        <div className="px-6 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full -ml-2"
            style={{ color: 'var(--slds-g-color-text-weak)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--slds-g-color-text-default)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--slds-g-color-text-weak)';
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
              New Youth
            </h1>
          </div>
        </div>
      </div>

      {/* Path Component */}
      <div 
        className="flex-shrink-0"
        style={{
          backgroundColor: 'var(--slds-g-color-background-base)',
          borderBottom: '1px solid var(--slds-g-color-border-base-1)'
        }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center gap-0 rounded-full overflow-hidden">
            {STAGES.map((stage, index) => {
              const isCompleted = currentStage > stage.key;
              const isCurrent = currentStage === stage.key;
              const isFuture = currentStage < stage.key;
              
              return (
                <div 
                  key={stage.key} 
                  className="flex-1 relative"
                  style={{ height: '44px' }}
                >
                  <div
                    className={cn(
                      "absolute inset-0 flex items-center justify-center cursor-pointer transition-all",
                      isCurrent && "bg-[var(--color-brand-primary)] text-white",
                      isCompleted && "bg-[#027E46] text-white cursor-pointer hover:bg-[#026639]"
                    )}
                    style={{
                      ...(isFuture && { 
                        backgroundColor: 'var(--slds-g-color-background-alt)',
                        color: 'var(--slds-g-color-text-weak)'
                      }),
                      clipPath: index === 0 
                        ? 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%)'
                        : index === STAGES.length - 1
                        ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 16px 50%)'
                        : 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%)'
                    }}
                    onClick={() => isCompleted && setCurrentStage(stage.key)}
                  >
                    <span className="text-sm font-medium whitespace-nowrap">{stage.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="grid grid-cols-3 gap-6">
          {/* Form Section - 2/3 width */}
          <div className="col-span-2">
            <div 
              className="rounded-[8px] shadow-sm"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)'
              }}
            >
              <div 
                className="px-6 py-4"
                style={{ borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}
              >
                <h2 className="text-base font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>{guidance.title}</h2>
              </div>
              
              <div className="p-6">
                {/* Stage 1: Intake */}
                {currentStage === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-semibold mb-1.5 block" style={{ color: 'var(--slds-g-color-text-default)' }}>
                          First Name <span className="text-red-600">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="border-gray-300"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                          Last Name <span className="text-red-600">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dob" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                          Date of Birth <span className="text-red-600">*</span>
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full rounded-full justify-start text-left font-normal border-gray-300",
                                !dateOfBirth && "text-gray-500"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateOfBirth ? formatDate(dateOfBirth) : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar selected={dateOfBirth} onSelect={setDateOfBirth} />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label htmlFor="program" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                          Program Interest
                        </Label>
                        <Select value={program} onValueChange={setProgram}>
                          <SelectTrigger className="border-gray-300">
                            <SelectValue placeholder="Select program" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mercy">Mercy Home</SelectItem>
                            <SelectItem value="bosco">Bosco Home</SelectItem>
                            <SelectItem value="community">Community Services</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">Guardian Information</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="guardianName" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                            Primary Guardian Name <span className="text-red-600">*</span>
                          </Label>
                          <Input
                            id="guardianName"
                            value={guardianName}
                            onChange={(e) => setGuardianName(e.target.value)}
                            className="border-gray-300"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="guardianPhone" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                              Phone
                            </Label>
                            <Input
                              id="guardianPhone"
                              type="tel"
                              value={guardianPhone}
                              onChange={(e) => setGuardianPhone(e.target.value)}
                              placeholder="(555) 123-4567"
                              className="border-gray-300"
                            />
                          </div>
                          <div>
                            <Label htmlFor="guardianEmail" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                              Email
                            </Label>
                            <Input
                              id="guardianEmail"
                              type="email"
                              value={guardianEmail}
                              onChange={(e) => setGuardianEmail(e.target.value)}
                              placeholder="guardian@example.com"
                              className="border-gray-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <div>
                        <Label htmlFor="referralSource" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                          Referral Source <span className="text-red-600">*</span>
                        </Label>
                        <Select value={referralSource} onValueChange={setReferralSource}>
                          <SelectTrigger className="border-gray-300">
                            <SelectValue placeholder="Select referral source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dcfs">DCFS</SelectItem>
                            <SelectItem value="school">School District</SelectItem>
                            <SelectItem value="hospital">Hospital/Clinic</SelectItem>
                            <SelectItem value="community">Community Organization</SelectItem>
                            <SelectItem value="parent">Parent/Guardian</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="mt-4">
                        <Label htmlFor="intakeNotes" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                          Intake Notes
                        </Label>
                        <Textarea
                          id="intakeNotes"
                          value={intakeNotes}
                          onChange={(e) => setIntakeNotes(e.target.value)}
                          rows={4}
                          className="border-gray-300"
                          placeholder="Additional notes about the intake..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage 2: Info Session */}
                {currentStage === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="infoSessionDate" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                        Info Session Date <span className="text-red-600">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full rounded-full justify-start text-left font-normal border-gray-300",
                              !infoSessionDate && "text-gray-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {infoSessionDate ? formatDate(infoSessionDate) : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar selected={infoSessionDate} onSelect={setInfoSessionDate} />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="familyInterest" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                        Family Interest Level <span className="text-red-600">*</span>
                      </Label>
                      <Select value={familyInterestLevel} onValueChange={setFamilyInterestLevel}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select interest level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High - Ready to move forward</SelectItem>
                          <SelectItem value="medium">Medium - Needs more information</SelectItem>
                          <SelectItem value="low">Low - Exploring options</SelectItem>
                          <SelectItem value="declined">Declined - Not interested</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="sessionNotes" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                        Session Notes
                      </Label>
                      <Textarea
                        id="sessionNotes"
                        value={sessionNotes}
                        onChange={(e) => setSessionNotes(e.target.value)}
                        rows={6}
                        className="border-gray-300"
                        placeholder="Key discussion points, family questions, concerns raised..."
                      />
                    </div>
                  </div>
                )}

                {/* Stage 3: Clinical Assessment */}
                {currentStage === 3 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="assessmentDate" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                        Assessment Date <span className="text-red-600">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full rounded-full justify-start text-left font-normal border-gray-300",
                              !assessmentDate && "text-gray-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {assessmentDate ? formatDate(assessmentDate) : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar selected={assessmentDate} onSelect={setAssessmentDate} />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="evaluatingClinician" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                        Evaluating Clinician <span className="text-red-600">*</span>
                      </Label>
                      <Input
                        id="evaluatingClinician"
                        value={evaluatingClinician}
                        onChange={(e) => setEvaluatingClinician(e.target.value)}
                        className="border-gray-300"
                        placeholder="Dr. Smith, LCPC"
                      />
                    </div>

                    <div>
                      <Label htmlFor="clinicianRecommendation" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                        Clinician's Recommendation <span className="text-red-600">*</span>
                      </Label>
                      <Select value={clinicianRecommendation} onValueChange={setClinicianRecommendation}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select recommendation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recommend">Recommend for Program</SelectItem>
                          <SelectItem value="conditional">Conditional Recommendation</SelectItem>
                          <SelectItem value="not-recommend">Do Not Recommend</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="clinicalNotes" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                        Clinical Notes
                      </Label>
                      <Textarea
                        id="clinicalNotes"
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        rows={6}
                        className="border-gray-300"
                        placeholder="Assessment findings, behavioral observations, treatment recommendations..."
                      />
                    </div>
                  </div>
                )}

                {/* Stage 4: Determination */}
                {currentStage === 4 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="determinationStatus" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                        Determination Status <span className="text-red-600">*</span>
                      </Label>
                      <Select value={determinationStatus} onValueChange={setDeterminationStatus}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Approved for Admission</SelectItem>
                          <SelectItem value="waitlist">Waitlisted</SelectItem>
                          <SelectItem value="denied">Denied</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="decisionDate" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                          Decision Date <span className="text-red-600">*</span>
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full rounded-full justify-start text-left font-normal border-gray-300",
                                !decisionDate && "text-gray-500"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {decisionDate ? formatDate(decisionDate) : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar selected={decisionDate} onSelect={setDecisionDate} />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label htmlFor="decidedBy" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                          Decided By <span className="text-red-600">*</span>
                        </Label>
                        <Input
                          id="decidedBy"
                          value={decidedBy}
                          onChange={(e) => setDecidedBy(e.target.value)}
                          className="border-gray-300"
                          placeholder="Director Name"
                        />
                      </div>
                    </div>

                    {determinationStatus === "denied" && (
                      <div>
                        <Label htmlFor="falloutReason" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                          Fallout Reason <span className="text-red-600">*</span>
                        </Label>
                        <Select value={falloutReason} onValueChange={setFalloutReason}>
                          <SelectTrigger className="border-gray-300">
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="capacity">No Capacity</SelectItem>
                            <SelectItem value="clinical">Clinical Mismatch</SelectItem>
                            <SelectItem value="family">Family Declined</SelectItem>
                            <SelectItem value="funding">Funding Issues</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="determinationNotes" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                        Determination Notes
                      </Label>
                      <Textarea
                        id="determinationNotes"
                        value={determinationNotes}
                        onChange={(e) => setDeterminationNotes(e.target.value)}
                        rows={4}
                        className="border-gray-300"
                        placeholder="Rationale for decision, any special considerations..."
                      />
                    </div>
                  </div>
                )}

                {/* Stage 5: Move-In */}
                {currentStage === 5 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="moveInDate" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                        Anticipated Move-In Date <span className="text-red-600">*</span>
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full rounded-full justify-start text-left font-normal border-gray-300",
                              !moveInDate && "text-gray-500"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {moveInDate ? formatDate(moveInDate) : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar selected={moveInDate} onSelect={setMoveInDate} />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="assignedCaseManager" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                          Assigned Case Manager
                        </Label>
                        <Select value={assignedCaseManager} onValueChange={setAssignedCaseManager}>
                          <SelectTrigger className="border-gray-300">
                            <SelectValue placeholder="Select case manager" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sarah">Sarah Johnson</SelectItem>
                            <SelectItem value="michael">Michael Chen</SelectItem>
                            <SelectItem value="jessica">Jessica Martinez</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="assignedClinician" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                          Assigned Clinician
                        </Label>
                        <Select value={assignedClinician} onValueChange={setAssignedClinician}>
                          <SelectTrigger className="border-gray-300">
                            <SelectValue placeholder="Select clinician" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dr-smith">Dr. Smith, LCPC</SelectItem>
                            <SelectItem value="dr-johnson">Dr. Johnson, PsyD</SelectItem>
                            <SelectItem value="dr-williams">Dr. Williams, LCSW</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="roomAssignment" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                        Room Assignment
                      </Label>
                      <Input
                        id="roomAssignment"
                        value={roomAssignment}
                        onChange={(e) => setRoomAssignment(e.target.value)}
                        className="border-gray-300"
                        placeholder="e.g., Room 201"
                      />
                    </div>

                    <div>
                      <Label htmlFor="initialProgramGoals" className="text-sm font-semibold text-gray-700 mb-1.5 block">
                        Initial Program Goals <span className="text-red-600">*</span>
                      </Label>
                      <Textarea
                        id="initialProgramGoals"
                        value={initialProgramGoals}
                        onChange={(e) => setInitialProgramGoals(e.target.value)}
                        rows={6}
                        className="border-gray-300"
                        placeholder="Outline the initial treatment goals and objectives for this resident..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Footer */}
              <div className="border-t border-[#dddbda] px-6 py-4 bg-[#fafaf9] flex justify-between items-center">
                <div>
                  {currentStage > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStage(currentStage - 1)}
                      className="rounded-full border-gray-300"
                    >
                      {currentStage === 2 ? "Back to Intake" :
                       currentStage === 3 ? "Back to Info Session" :
                       currentStage === 4 ? "Back to Clinical Assessment" :
                       "Back to Determination"}
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="rounded-full border-gray-300"
                  >
                    Save for Later
                  </Button>
                  <Button
                    className="rounded-full bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)]/90 text-white"
                    onClick={handleNext}
                  >
                    {currentStage === 1 ? "Create Youth" :
                     currentStage === 2 ? "Complete Session" :
                     currentStage === 3 ? "Complete Assessment" :
                     currentStage === 4 && determinationStatus === "denied" ? "Deny & Close" :
                     currentStage === 4 ? "Approve Candidate" :
                     "Complete Move-In"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Guidance Panel - 1/3 width */}
          <div className="col-span-1">
            <div 
              className="rounded-[8px] shadow-sm sticky top-6"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)'
              }}
            >
              <div 
                className="px-4 py-3"
                style={{
                  borderBottom: '1px solid var(--slds-g-color-border-base-1)',
                  backgroundColor: 'var(--slds-g-color-background-alt)'
                }}
              >
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-[var(--color-brand-primary)]" />
                  <h3 className="text-sm font-semibold text-gray-900">Stage Guidance</h3>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">{guidance.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{guidance.description}</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h5 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Key Fields</h5>
                  <ul className="space-y-1.5">
                    {guidance.keyFields.map((field, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="h-3.5 w-3.5 text-[var(--color-brand-primary)] mt-0.5 flex-shrink-0" />
                        <span>{field}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {currentStage === 1 && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-xs text-blue-800">
                        <strong>Tip:</strong> All fields marked with <span className="text-red-600">*</span> are required to advance to the next stage.
                      </p>
                    </div>
                  </div>
                )}

                {currentStage === 4 && determinationStatus === "denied" && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="text-xs text-yellow-800">
                        <strong>Note:</strong> Selecting "Denied" will close this record and capture fallout data for reporting purposes.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}