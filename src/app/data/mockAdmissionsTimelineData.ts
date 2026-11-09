import { TimelineActivity } from "../components/ActivityTimeline";

// Mock timeline activities for admissions leads
export const ADMISSIONS_LEAD_TIMELINES: Record<string, TimelineActivity[]> = {
  "default": [
    {
      id: "ADM-001",
      type: "status_change",
      title: "Stage Advanced: Assessments",
      description: "moved lead from Info Session to Assessments stage. All info session requirements met.",
      user: "Sarah Williams",
      timestamp: "2026-02-17T09:15:00",
      status: "completed",
      category: "internal"
    },
    {
      id: "ADM-002",
      type: "call",
      title: "DCFS Caseworker Call",
      description: "spoke with DCFS caseworker Maria Lopez regarding placement authorization and transfer timeline. Caseworker confirmed youth is cleared for residential placement pending final DCFS approval letter. Expected within 5 business days.",
      user: "David Chen",
      timestamp: "2026-02-16T14:30:00",
      status: "completed",
      category: "dcfs",
      isFlagged: true
    },
    {
      id: "ADM-003",
      type: "meeting",
      title: "Info Session Attended",
      description: "family attended info session. Guardian asked detailed questions about educational programming and therapeutic support. Very engaged and positive about the program.",
      user: "Sarah Williams",
      timestamp: "2026-02-15T10:00:00",
      status: "completed",
      category: "school"
    },
    {
      id: "ADM-004",
      type: "note",
      title: "Medical Records Review",
      description: "reviewed medical records received from pediatrician. Youth has asthma (well-controlled), current on vaccinations. No acute medical concerns flagged. Need to follow up on recent dental exam.",
      user: "Lisa Chen",
      timestamp: "2026-02-14T16:45:00",
      category: "medical"
    },
    {
      id: "ADM-005",
      type: "email",
      title: "Assessment Scheduling",
      description: "sent email to guardian with available assessment dates and required documentation checklist.",
      user: "Sarah Williams",
      timestamp: "2026-02-14T11:20:00",
      status: "completed",
      category: "internal"
    },
    {
      id: "ADM-006",
      type: "call",
      title: "Guardian Follow-up",
      description: "called guardian to discuss assessment scheduling. Guardian confirmed availability for Feb 20. Reminded about bringing school records and medical forms.",
      user: "David Chen",
      timestamp: "2026-02-13T13:00:00",
      status: "completed",
      category: "family"
    },
    {
      id: "ADM-007",
      type: "note",
      title: "DCFS Authorization Received",
      description: "received DCFS placement authorization letter via fax. Document uploaded to case file. Authorization valid through March 31, 2026.",
      user: "Sarah Williams",
      timestamp: "2026-02-12T09:30:00",
      category: "dcfs",
      isFlagged: true
    },
    {
      id: "ADM-008",
      type: "call",
      title: "Legal Status Clarification",
      description: "called public defender's office to clarify legal status. Confirmed no outstanding warrants or pending court dates that would conflict with admission timeline.",
      user: "David Chen",
      timestamp: "2026-02-11T15:15:00",
      status: "completed",
      category: "legal"
    },
    {
      id: "ADM-009",
      type: "meeting",
      title: "Clinical Pre-Screen",
      description: "completed initial clinical pre-screen via phone. Youth presents with anxiety symptoms, history of school avoidance. No acute safety concerns. Recommend full clinical assessment.",
      user: "Dr. Amanda Torres",
      timestamp: "2026-02-10T11:00:00",
      status: "completed",
      category: "mental_health"
    },
    {
      id: "ADM-010",
      type: "note",
      title: "School Records Received",
      description: "received academic transcripts and IEP documentation from Lincoln Park High School. GPA 2.1, IEP in place for SLD in reading. Currently in 10th grade.",
      user: "Michael Davis",
      timestamp: "2026-02-09T14:00:00",
      category: "school"
    },
    {
      id: "ADM-011",
      type: "email",
      title: "Welcome Packet Sent",
      description: "sent comprehensive welcome packet to guardian including program overview, FAQ, visitation policies, and required documentation checklist.",
      user: "Sarah Williams",
      timestamp: "2026-02-08T10:45:00",
      status: "completed",
      category: "internal"
    },
    {
      id: "ADM-012",
      type: "call",
      title: "Initial Referral Call",
      description: "received referral call from DCFS caseworker. Youth is a 15-year-old male currently in temporary foster placement. Requesting residential services due to behavioral concerns at current placement.",
      user: "David Chen",
      timestamp: "2026-02-07T09:00:00",
      status: "completed",
      category: "dcfs"
    },
    {
      id: "ADM-013",
      type: "note",
      title: "Housing Assessment Note",
      description: "documented current living situation per caseworker report. Youth has been in 3 placements in last 6 months. Current foster family supportive but unable to manage behavioral escalations.",
      user: "Sarah Williams",
      timestamp: "2026-02-06T16:30:00",
      category: "housing"
    },
    {
      id: "ADM-014",
      type: "status_change",
      title: "Lead Created",
      description: "created new admissions lead from DCFS referral. Assigned to Sarah Williams as primary case coordinator.",
      user: "System",
      timestamp: "2026-02-06T08:00:00",
      status: "completed",
      category: "internal"
    }
  ]
};

// Generate timeline for any admissions lead
export function getTimelineForAdmissionsLead(leadId: string): TimelineActivity[] {
  if (ADMISSIONS_LEAD_TIMELINES[leadId]) {
    return ADMISSIONS_LEAD_TIMELINES[leadId];
  }
  // Return default rich timeline for all leads
  return ADMISSIONS_LEAD_TIMELINES["default"];
}
