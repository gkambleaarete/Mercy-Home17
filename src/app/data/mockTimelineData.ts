import { TimelineActivity } from "../components/ActivityTimeline";

// Mock timeline activities for each contact log
export const CONTACT_LOG_TIMELINES: Record<string, TimelineActivity[]> = {
  "CL-001": [
    {
      id: "ACT-001-1",
      type: "call",
      title: "Follow-up Call",
      description: "logged a call regarding missing consent form. Guardian will email signed form by end of day.",
      user: "Sarah Williams",
      timestamp: "2025-12-08T10:30:00",
      status: "completed",
      category: "legal"
    },
    {
      id: "ACT-001-2",
      type: "email",
      title: "Consent Form Request",
      description: "sent email with consent form template and instructions.",
      user: "Sarah Williams",
      timestamp: "2025-12-07T14:15:00",
      status: "completed"
    },
    {
      id: "ACT-001-2A",
      type: "task",
      title: "Review Signed Consent Form",
      description: "Verify the signed consent form once received and update the applicant record if all required signatures are present.",
      user: "Sarah Williams",
      timestamp: "2025-12-07T16:00:00",
      status: "pending",
      category: "legal"
    },
    {
      id: "ACT-001-3",
      type: "note",
      title: "Initial Contact Note",
      description: "added note: Guardian expressed strong interest in program. Needs to complete consent documentation.",
      user: "David Chen",
      timestamp: "2025-12-06T09:00:00",
      category: "family"
    },
    {
      id: "ACT-001-4",
      type: "call",
      title: "Initial Inquiry",
      description: "logged initial inquiry call. Discussed program overview and next steps.",
      user: "David Chen",
      timestamp: "2025-12-05T16:45:00",
      status: "completed",
      category: "dcfs"
    }
  ],

  "CL-002": [
    {
      id: "ACT-002-1",
      type: "status_change",
      title: "Promoted to Admissions",
      description: "promoted contact to Admissions Process. All requirements met.",
      user: "David Chen",
      timestamp: "2025-12-07T15:30:00",
      status: "completed",
      category: "internal"
    },
    {
      id: "ACT-002-2",
      type: "email",
      title: "Welcome Packet Sent",
      description: "sent comprehensive welcome packet with program overview and next steps.",
      user: "David Chen",
      timestamp: "2025-12-07T14:15:00",
      status: "completed"
    },
    {
      id: "ACT-002-2A",
      type: "task",
      title: "Schedule Admissions Interview",
      description: "Coordinate with the admissions coordinator to schedule the family's interview and confirm availability.",
      user: "David Chen",
      timestamp: "2025-12-07T15:00:00",
      status: "pending",
      category: "school"
    },
    {
      id: "ACT-002-3",
      type: "meeting",
      title: "Info Session Attended",
      description: "attended info session. Very engaged, asked detailed questions about curriculum.",
      user: "Sarah Williams",
      timestamp: "2025-12-06T10:00:00",
      status: "completed",
      category: "school"
    },
    {
      id: "ACT-002-4",
      type: "call",
      title: "Initial Contact",
      description: "logged call from guardian. Scheduled info session for Dec 6.",
      user: "Sarah Williams",
      timestamp: "2025-12-04T11:20:00",
      status: "completed",
      category: "dcfs"
    }
  ],

  "CL-003": [
    {
      id: "ACT-003-1",
      type: "meeting",
      title: "Info Session Confirmation",
      description: "confirmed attendance for tomorrow's info session at facility.",
      user: "David Chen",
      timestamp: "2025-12-08T11:00:00",
      status: "completed",
      category: "school"
    },
    {
      id: "ACT-003-2",
      type: "call",
      title: "Follow-up Call",
      description: "logged call to discuss program details and answer questions.",
      user: "David Chen",
      timestamp: "2025-12-07T13:30:00",
      status: "completed",
      category: "housing"
    },
    {
      id: "ACT-003-3",
      type: "email",
      title: "Info Session Invite",
      description: "sent info session invitation with date, time, and location details.",
      user: "Sarah Williams",
      timestamp: "2025-12-06T09:15:00",
      status: "completed"
    },
    {
      id: "ACT-003-3A",
      type: "task",
      title: "Prepare Info Session Materials",
      description: "Print welcome packet and attendance sheet before tomorrow's information session.",
      user: "Sarah Williams",
      timestamp: "2025-12-06T10:00:00",
      status: "completed",
      category: "school"
    }
  ],

  "CL-004": [
    {
      id: "ACT-004-1",
      type: "meeting",
      title: "FPM Scheduled",
      description: "scheduled Family Partnership Meeting for Dec 10. Shadow day feedback was very positive.",
      user: "Sarah Williams",
      timestamp: "2025-12-07T09:45:00",
      status: "pending",
      category: "family"
    },
    {
      id: "ACT-004-1A",
      type: "task",
      title: "Confirm FPM Attendance",
      description: "Contact all participants and confirm attendance for the upcoming Family Partnership Meeting.",
      user: "Sarah Williams",
      timestamp: "2025-12-07T10:15:00",
      status: "pending",
      category: "family"
    },
    {
      id: "ACT-004-2",
      type: "note",
      title: "Shadow Day Complete",
      description: "added note: Candidate completed shadow day. Positive experience reported by staff and candidate.",
      user: "Sarah Williams",
      timestamp: "2025-12-05T15:30:00",
      category: "school"
    },
    {
      id: "ACT-004-3",
      type: "call",
      title: "Shadow Day Confirmation",
      description: "logged call to confirm shadow day appointment and provide directions.",
      user: "David Chen",
      timestamp: "2025-12-04T10:00:00",
      status: "completed",
      category: "dcfs"
    }
  ],

  "CL-005": [
    {
      id: "ACT-005-1",
      type: "call",
      title: "Medical Assessment Follow-up",
      description: "left voicemail regarding overdue medical assessment. Requested callback to discuss missing lab results.",
      user: "Sarah Williams",
      timestamp: "2025-12-06T15:30:00",
      status: "pending",
      category: "medical"
    },
    {
      id: "ACT-005-2",
      type: "email",
      title: "Lab Results Request",
      description: "sent email requesting missing lab results from medical provider.",
      user: "Sarah Williams",
      timestamp: "2025-12-05T11:00:00",
      status: "completed",
      category: "medical"
    },
    {
      id: "ACT-005-2A",
      type: "task",
      title: "Collect Outstanding Lab Results",
      description: "Follow up with the medical provider and upload all remaining laboratory reports before the medical review deadline.",
      user: "Sarah Williams",
      timestamp: "2025-12-05T13:00:00",
      status: "pending",
      category: "medical"
    },
    {
      id: "ACT-005-3",
      type: "note",
      title: "Medical Forms Received",
      description: "added note: Initial medical forms received, but lab results are still pending.",
      user: "David Chen",
      timestamp: "2025-12-03T14:20:00",
      category: "medical"
    }
  ]
};

// Generate default timeline for any contact log without specific data
export function getTimelineForContactLog(contactLogId: string): TimelineActivity[] {
  // Return specific timeline if exists
  if (CONTACT_LOG_TIMELINES[contactLogId]) {
    return CONTACT_LOG_TIMELINES[contactLogId];
  }

  // Generate generic timeline for logs without specific data
  return [
    {
      id: `${contactLogId}-1`,
      type: "note",
      title: "Contact Log Created",
      description: "created contact log entry.",
      user: "System",
      timestamp: new Date().toISOString()
    }
  ];
}