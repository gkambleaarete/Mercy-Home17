import { CheckCircle, Circle, Clock } from "@/app/lib/lucide-icons";
import { Lead } from "../../data/mockLeadsData";
import { Badge } from "../ui/badge";
import { formatMdy } from "../../lib/dateFormat";

interface StageProgressDataProps {
  lead: Lead;
}

export function StageProgressData({ lead }: StageProgressDataProps) {
  const completedStages = lead.completedStages || [];
  
  return (
    <div className="space-y-4">
      {/* Lead Intake Stage */}
      <div className="border rounded-lg p-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
        <div className="flex items-center gap-2 mb-3">
          {completedStages.includes("Lead Intake") ? (
            <CheckCircle className="h-5 w-5 text-green-600" strokeWidth={2.5} />
          ) : lead.stage === "Lead Intake" ? (
            <Clock className="h-5 w-5 text-[#145F33]" strokeWidth={2.5} />
          ) : (
            <Circle className="h-5 w-5 text-gray-400" strokeWidth={2.5} />
          )}
          <h3 className="text-sm font-bold" style={{ color: 'var(--slds-g-color-text-default)' }}>
            Lead Intake
          </h3>
          {completedStages.includes("Lead Intake") && (
            <Badge className="ml-auto bg-green-100 text-green-800 border-none hover:bg-green-100 text-xs">
              Completed
            </Badge>
          )}
          {lead.stage === "Lead Intake" && !completedStages.includes("Lead Intake") && (
            <Badge className="ml-auto bg-[#145F33] text-white border-none hover:bg-[#145F33] text-xs">
              In Progress
            </Badge>
          )}
        </div>
        
        {lead.intakeData && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            {lead.intakeData.intakeDate && (
              <div>
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Intake Date:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                  {formatMdy(new Date(lead.intakeData.intakeDate))}
                </p>
              </div>
            )}
            {lead.intakeData.inquirySource && (
              <div>
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Inquiry Source:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>{lead.intakeData.inquirySource}</p>
              </div>
            )}
            {lead.intakeData.referralSource && (
              <div>
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Referral Source:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>{lead.intakeData.referralSource}</p>
              </div>
            )}
            {lead.intakeData.intakeFormCompleted !== undefined && (
              <div>
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Intake Form:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                  {lead.intakeData.intakeFormCompleted ? "Completed" : "Pending"}
                </p>
              </div>
            )}
            {lead.intakeData.initialContactNotes && (
              <div className="col-span-2">
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Notes:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>{lead.intakeData.initialContactNotes}</p>
              </div>
            )}
          </div>
        )}
        
        {!lead.intakeData && (
          <p className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>No intake data available</p>
        )}
      </div>

      {/* Info Session Stage */}
      <div className="border rounded-lg p-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
        <div className="flex items-center gap-2 mb-3">
          {completedStages.includes("Info Session") ? (
            <CheckCircle className="h-5 w-5 text-green-600" strokeWidth={2.5} />
          ) : lead.stage === "Info Session" ? (
            <Clock className="h-5 w-5 text-[#145F33]" strokeWidth={2.5} />
          ) : (
            <Circle className="h-5 w-5 text-gray-400" strokeWidth={2.5} />
          )}
          <h3 className="text-sm font-bold" style={{ color: 'var(--slds-g-color-text-default)' }}>
            Info Session
          </h3>
          {completedStages.includes("Info Session") && (
            <Badge className="ml-auto bg-green-100 text-green-800 border-none hover:bg-green-100 text-xs">
              Completed
            </Badge>
          )}
          {lead.stage === "Info Session" && !completedStages.includes("Info Session") && (
            <Badge className="ml-auto bg-[#145F33] text-white border-none hover:bg-[#145F33] text-xs">
              In Progress
            </Badge>
          )}
        </div>
        
        {lead.infoSessionData && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            {lead.infoSessionData.sessionDate && (
              <div>
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Session Date:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                  {formatMdy(new Date(lead.infoSessionData.sessionDate))}
                </p>
              </div>
            )}
            {lead.infoSessionData.sessionAttended !== undefined && (
              <div>
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Attended:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                  {lead.infoSessionData.sessionAttended ? "Yes" : "No"}
                </p>
              </div>
            )}
            {lead.infoSessionData.interestLevel && (
              <div>
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Interest Level:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>{lead.infoSessionData.interestLevel}</p>
              </div>
            )}
            {lead.infoSessionData.followUpScheduled !== undefined && (
              <div>
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Follow-up:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                  {lead.infoSessionData.followUpScheduled ? "Scheduled" : "Not Scheduled"}
                </p>
              </div>
            )}
            {lead.infoSessionData.attendees && lead.infoSessionData.attendees.length > 0 && (
              <div className="col-span-2">
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Attendees:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                  {lead.infoSessionData.attendees.join(", ")}
                </p>
              </div>
            )}
            {lead.infoSessionData.sessionNotes && (
              <div className="col-span-2">
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Notes:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>{lead.infoSessionData.sessionNotes}</p>
              </div>
            )}
          </div>
        )}
        
        {!lead.infoSessionData && (
          <p className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>No info session data available</p>
        )}
      </div>

      {/* Assessments Stage */}
      <div className="border rounded-lg p-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
        <div className="flex items-center gap-2 mb-3">
          {completedStages.includes("Assessments") ? (
            <CheckCircle className="h-5 w-5 text-green-600" strokeWidth={2.5} />
          ) : lead.stage === "Assessments" ? (
            <Clock className="h-5 w-5 text-[#145F33]" strokeWidth={2.5} />
          ) : (
            <Circle className="h-5 w-5 text-gray-400" strokeWidth={2.5} />
          )}
          <h3 className="text-sm font-bold" style={{ color: 'var(--slds-g-color-text-default)' }}>
            Assessments
          </h3>
          {completedStages.includes("Assessments") && (
            <Badge className="ml-auto bg-green-100 text-green-800 border-none hover:bg-green-100 text-xs">
              Completed
            </Badge>
          )}
          {lead.stage === "Assessments" && !completedStages.includes("Assessments") && (
            <Badge className="ml-auto bg-[#145F33] text-white border-none hover:bg-[#145F33] text-xs">
              In Progress
            </Badge>
          )}
        </div>
        
        {lead.assessmentData && (
          <div className="space-y-3">
            {/* Medical Assessment */}
            <div className="border-l-2 border-gray-300 pl-3">
              <p className="font-semibold text-xs mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Medical Assessment</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {lead.assessmentData.medicalExamDate && (
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Exam Date:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {formatMdy(new Date(lead.assessmentData.medicalExamDate))}
                    </p>
                  </div>
                )}
                {lead.assessmentData.medicalExamCompleted !== undefined && (
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Status:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {lead.assessmentData.medicalExamCompleted ? "Completed" : "Pending"}
                    </p>
                  </div>
                )}
                {lead.assessmentData.medicalNotes && (
                  <div className="col-span-2">
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Notes:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>{lead.assessmentData.medicalNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Psychological Assessment */}
            <div className="border-l-2 border-gray-300 pl-3">
              <p className="font-semibold text-xs mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Psychological Assessment</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {lead.assessmentData.psychExamDate && (
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Exam Date:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {formatMdy(new Date(lead.assessmentData.psychExamDate))}
                    </p>
                  </div>
                )}
                {lead.assessmentData.psychExamCompleted !== undefined && (
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Status:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {lead.assessmentData.psychExamCompleted ? "Completed" : "Pending"}
                    </p>
                  </div>
                )}
                {lead.assessmentData.psychNotes && (
                  <div className="col-span-2">
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Notes:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>{lead.assessmentData.psychNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Educational Assessment */}
            <div className="border-l-2 border-gray-300 pl-3">
              <p className="font-semibold text-xs mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Educational Assessment</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {lead.assessmentData.educationalAssessmentDate && (
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Assessment Date:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {formatMdy(new Date(lead.assessmentData.educationalAssessmentDate))}
                    </p>
                  </div>
                )}
                {lead.assessmentData.educationalAssessmentCompleted !== undefined && (
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Status:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {lead.assessmentData.educationalAssessmentCompleted ? "Completed" : "Pending"}
                    </p>
                  </div>
                )}
                {lead.assessmentData.educationalNotes && (
                  <div className="col-span-2">
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Notes:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>{lead.assessmentData.educationalNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Background Check */}
            <div className="border-l-2 border-gray-300 pl-3">
              <p className="font-semibold text-xs mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Background Check</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {lead.assessmentData.backgroundCheckDate && (
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Check Date:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {formatMdy(new Date(lead.assessmentData.backgroundCheckDate))}
                    </p>
                  </div>
                )}
                {lead.assessmentData.backgroundCheckStatus && (
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Status:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {lead.assessmentData.backgroundCheckStatus}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {!lead.assessmentData && (
          <p className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>No assessment data available</p>
        )}
      </div>

      {/* Shadow & FPM Stage */}
      <div className="border rounded-lg p-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
        <div className="flex items-center gap-2 mb-3">
          {completedStages.includes("Shadow & FPM") ? (
            <CheckCircle className="h-5 w-5 text-green-600" strokeWidth={2.5} />
          ) : lead.stage === "Shadow & FPM" ? (
            <Clock className="h-5 w-5 text-[#145F33]" strokeWidth={2.5} />
          ) : (
            <Circle className="h-5 w-5 text-gray-400" strokeWidth={2.5} />
          )}
          <h3 className="text-sm font-bold" style={{ color: 'var(--slds-g-color-text-default)' }}>
            Shadow & Family Partnership Meeting
          </h3>
          {completedStages.includes("Shadow & FPM") && (
            <Badge className="ml-auto bg-green-100 text-green-800 border-none hover:bg-green-100 text-xs">
              Completed
            </Badge>
          )}
          {lead.stage === "Shadow & FPM" && !completedStages.includes("Shadow & FPM") && (
            <Badge className="ml-auto bg-[#145F33] text-white border-none hover:bg-[#145F33] text-xs">
              In Progress
            </Badge>
          )}
        </div>
        
        {lead.shadowFPMData && (
          <div className="space-y-3">
            {/* Shadow Day */}
            <div className="border-l-2 border-gray-300 pl-3">
              <p className="font-semibold text-xs mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Shadow Day</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {lead.shadowFPMData.shadowDate && (
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Shadow Date:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {formatMdy(new Date(lead.shadowFPMData.shadowDate))}
                    </p>
                  </div>
                )}
                {lead.shadowFPMData.shadowCompleted !== undefined && (
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Status:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {lead.shadowFPMData.shadowCompleted ? "Completed" : "Pending"}
                    </p>
                  </div>
                )}
                {lead.shadowFPMData.shadowNotes && (
                  <div className="col-span-2">
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Notes:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>{lead.shadowFPMData.shadowNotes}</p>
                  </div>
                )}
                {lead.shadowFPMData.shadowFeedback && (
                  <div className="col-span-2">
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Feedback:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>{lead.shadowFPMData.shadowFeedback}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Family Partnership Meeting */}
            <div className="border-l-2 border-gray-300 pl-3">
              <p className="font-semibold text-xs mb-1" style={{ color: 'var(--slds-g-color-text-default)' }}>Family Partnership Meeting</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {lead.shadowFPMData.fpmDate && (
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>FPM Date:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {formatMdy(new Date(lead.shadowFPMData.fpmDate))}
                    </p>
                  </div>
                )}
                {lead.shadowFPMData.fpmCompleted !== undefined && (
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Status:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {lead.shadowFPMData.fpmCompleted ? "Completed" : "Pending"}
                    </p>
                  </div>
                )}
                {lead.shadowFPMData.fpmAttendees && lead.shadowFPMData.fpmAttendees.length > 0 && (
                  <div className="col-span-2">
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Attendees:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {lead.shadowFPMData.fpmAttendees.join(", ")}
                    </p>
                  </div>
                )}
                {lead.shadowFPMData.fpmGoals && lead.shadowFPMData.fpmGoals.length > 0 && (
                  <div className="col-span-2">
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Goals:</span>
                    <ul className="list-disc pl-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {lead.shadowFPMData.fpmGoals.map((goal, idx) => (
                        <li key={idx}>{goal}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {lead.shadowFPMData.fpmNotes && (
                  <div className="col-span-2">
                    <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Notes:</span>
                    <p style={{ color: 'var(--slds-g-color-text-default)' }}>{lead.shadowFPMData.fpmNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {!lead.shadowFPMData && (
          <p className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>No shadow/FPM data available</p>
        )}
      </div>

      {/* Staffing Stage */}
      <div className="border rounded-lg p-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
        <div className="flex items-center gap-2 mb-3">
          {completedStages.includes("Staffing") ? (
            <CheckCircle className="h-5 w-5 text-green-600" strokeWidth={2.5} />
          ) : lead.stage === "Staffing" ? (
            <Clock className="h-5 w-5 text-[#145F33]" strokeWidth={2.5} />
          ) : (
            <Circle className="h-5 w-5 text-gray-400" strokeWidth={2.5} />
          )}
          <h3 className="text-sm font-bold" style={{ color: 'var(--slds-g-color-text-default)' }}>
            Staffing
          </h3>
          {completedStages.includes("Staffing") && (
            <Badge className="ml-auto bg-green-100 text-green-800 border-none hover:bg-green-100 text-xs">
              Completed
            </Badge>
          )}
          {lead.stage === "Staffing" && !completedStages.includes("Staffing") && (
            <Badge className="ml-auto bg-[#145F33] text-white border-none hover:bg-[#145F33] text-xs">
              In Progress
            </Badge>
          )}
        </div>
        
        {lead.staffingData && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            {lead.staffingData.staffingDate && (
              <div>
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Staffing Date:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                  {formatMdy(new Date(lead.staffingData.staffingDate))}
                </p>
              </div>
            )}
            {lead.staffingData.decision && (
              <div>
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Decision:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>{lead.staffingData.decision}</p>
              </div>
            )}
            {lead.staffingData.teamMembers && lead.staffingData.teamMembers.length > 0 && (
              <div className="col-span-2">
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Team Members:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                  {lead.staffingData.teamMembers.join(", ")}
                </p>
              </div>
            )}
            {lead.staffingData.conditions && lead.staffingData.conditions.length > 0 && (
              <div className="col-span-2">
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Conditions:</span>
                <ul className="list-disc pl-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
                  {lead.staffingData.conditions.map((condition, idx) => (
                    <li key={idx}>{condition}</li>
                  ))}
                </ul>
              </div>
            )}
            {lead.staffingData.staffingNotes && (
              <div className="col-span-2">
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Notes:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>{lead.staffingData.staffingNotes}</p>
              </div>
            )}
          </div>
        )}
        
        {!lead.staffingData && (
          <p className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>No staffing data available</p>
        )}
      </div>

      {/* Move-In Stage */}
      <div className="border rounded-lg p-4" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
        <div className="flex items-center gap-2 mb-3">
          {completedStages.includes("Move-In") ? (
            <CheckCircle className="h-5 w-5 text-green-600" strokeWidth={2.5} />
          ) : lead.stage === "Move-In" ? (
            <Clock className="h-5 w-5 text-[#145F33]" strokeWidth={2.5} />
          ) : (
            <Circle className="h-5 w-5 text-gray-400" strokeWidth={2.5} />
          )}
          <h3 className="text-sm font-bold" style={{ color: 'var(--slds-g-color-text-default)' }}>
            Move-In
          </h3>
          {completedStages.includes("Move-In") && (
            <Badge className="ml-auto bg-green-100 text-green-800 border-none hover:bg-green-100 text-xs">
              Completed
            </Badge>
          )}
          {lead.stage === "Move-In" && !completedStages.includes("Move-In") && (
            <Badge className="ml-auto bg-[#145F33] text-white border-none hover:bg-[#145F33] text-xs">
              In Progress
            </Badge>
          )}
        </div>
        
        {lead.moveInData && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            {lead.moveInData.moveInDate && (
              <div>
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Move-In Date:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                  {formatMdy(new Date(lead.moveInData.moveInDate))}
                </p>
              </div>
            )}
            {lead.moveInData.roomNumber && (
              <div>
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Room Number:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>{lead.moveInData.roomNumber}</p>
              </div>
            )}
            {lead.moveInData.roommate && (
              <div>
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Roommate:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>{lead.moveInData.roommate}</p>
              </div>
            )}
            {lead.moveInData.orientationCompleted !== undefined && (
              <div>
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Orientation:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                  {lead.moveInData.orientationCompleted ? "Completed" : "Pending"}
                </p>
              </div>
            )}
            {lead.moveInData.checklistCompleted !== undefined && (
              <div>
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Checklist:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                  {lead.moveInData.checklistCompleted ? "Completed" : "Pending"}
                </p>
              </div>
            )}
            {lead.moveInData.welcomePacketProvided !== undefined && (
              <div>
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Welcome Packet:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>
                  {lead.moveInData.welcomePacketProvided ? "Provided" : "Not Provided"}
                </p>
              </div>
            )}
            {lead.moveInData.moveInNotes && (
              <div className="col-span-2">
                <span className="font-semibold" style={{ color: 'var(--slds-g-color-text-weak)' }}>Notes:</span>
                <p style={{ color: 'var(--slds-g-color-text-default)' }}>{lead.moveInData.moveInNotes}</p>
              </div>
            )}
          </div>
        )}
        
        {!lead.moveInData && (
          <p className="text-xs" style={{ color: 'var(--slds-g-color-text-weak)' }}>No move-in data available</p>
        )}
      </div>
    </div>
  );
}
