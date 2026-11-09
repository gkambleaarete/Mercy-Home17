
import { localTodayIso } from "../lib/dateFormat";// Mock contact log data matching Salesforce-style Contact Log structure

export interface ContactLog {
  id: string;
  referralDate: string; // ISO date string
  caller: string;
  candidate: string;
  phone: string;
  language: string;
  mostRecentHistory: string; // ISO date string
  details: string;
  needsFollowUp: "Yes" | "No";
  promoted: boolean;
  leadId?: string; // Optional reference to lead
  gender?: string; // Gender of candidate
  ageGroup?: string; // Age group: Middle School, High School, Young Adult
}

export const CONTACT_LOGS: ContactLog[] = [
  {
    id: "CL-001",
    referralDate: "2025-12-08",
    caller: "Jane Doe",
    candidate: "John Doe",
    phone: "(555) 123-4567",
    language: "English",
    mostRecentHistory: "2025-12-08",
    details:
      "12/8/2025 10:30 AM Sarah Williams - Follow-up on consent form. Spoke with Jane Doe (guardian) regarding missing consent form. She will email the signed form by end of day.",
    needsFollowUp: "Yes",
    promoted: false,
    leadId: "L-001",
    gender: "Male",
    ageGroup: "High School",
  },
  {
    id: "CL-002",
    referralDate: "2025-12-07",
    caller: "Robert Smith",
    candidate: "Sarah Smith",
    phone: "(555) 987-6543",
    language: "English",
    mostRecentHistory: "2025-12-07",
    details:
      "12/7/2025 2:15 PM David Chen - Initial welcome packet sent. Sent comprehensive welcome packet with program overview, next steps, and contact information.",
    needsFollowUp: "No",
    promoted: true,
    leadId: "L-002",
    gender: "Female",
    ageGroup: "Middle School",
  },
  {
    id: "CL-003",
    referralDate: "2025-12-07",
    caller: "Emily Jones",
    candidate: "Mike Jones",
    phone: "(555) 456-7890",
    language: "English",
    mostRecentHistory: "2025-12-08",
    details:
      "12/7/2025 11:00 AM David Chen - Info session attendance confirmation. Met with Emily Jones at facility. Confirmed attendance for tomorrow's info session.",
    needsFollowUp: "No",
    promoted: false,
    leadId: "L-003",
    gender: "Male",
    ageGroup: "Young Adult",
  },
  {
    id: "CL-004",
    referralDate: "2025-12-07",
    caller: "Carlos Rodriguez",
    candidate: "Amanda Rodriguez",
    phone: "(555) 234-5678",
    language: "Spanish",
    mostRecentHistory: "2025-12-10",
    details:
      "12/7/2025 9:45 AM Sarah Williams - Shadow day debrief. Called Carlos Rodriguez to discuss shadow day experience. Very positive feedback. Scheduled FPM for Dec 10.",
    needsFollowUp: "Yes",
    promoted: false,
    leadId: "L-004",
    gender: "Female",
    ageGroup: "High School",
  },
  {
    id: "CL-005",
    referralDate: "2025-12-06",
    caller: "Robert Taylor",
    candidate: "Jessica Taylor",
    phone: "(555) 567-8901",
    language: "English",
    mostRecentHistory: "2025-12-08",
    details:
      "12/6/2025 3:30 PM Sarah Williams - Medical assessment follow-up. Left voicemail for Robert Taylor regarding overdue medical assessment. Requested callback to discuss missing lab results.",
    needsFollowUp: "Yes",
    promoted: false,
    leadId: "L-006",
    gender: "Female",
    ageGroup: "High School",
  },
  {
    id: "CL-006",
    referralDate: "2025-12-06",
    caller: "Michelle Lee",
    candidate: "Brandon Lee",
    phone: "(555) 345-6789",
    language: "English",
    mostRecentHistory: "2025-12-06",
    details:
      "12/6/2025 1:00 PM David Chen - Staffing meeting reminder. Sent staffing meeting confirmation to Michelle Lee with agenda, required documents list, and Zoom link.",
    needsFollowUp: "No",
    promoted: false,
    leadId: "L-005",
    gender: "Male",
    ageGroup: "Middle School",
  },
  {
    id: "CL-007",
    referralDate: "2025-12-06",
    caller: "Lisa Brown",
    candidate: "Christopher Brown",
    phone: "(555) 678-9012",
    language: "English",
    mostRecentHistory: "2025-12-08",
    details:
      "12/6/2025 10:00 AM David Chen - Move-in checklist review. Video call with Lisa Brown to review move-in checklist. Covered room assignment, packing list, first day schedule.",
    needsFollowUp: "Yes",
    promoted: true,
    leadId: "L-007",
    gender: "Male",
    ageGroup: "Young Adult",
  },
  {
    id: "CL-008",
    referralDate: "2025-12-05",
    caller: "Jose Martinez",
    candidate: "Kayla Martinez",
    phone: "(555) 789-0123",
    language: "Spanish",
    mostRecentHistory: "2025-12-05",
    details:
      "12/5/2025 4:20 PM Sarah Williams - Info session confirmation. Text message sent to Jose Martinez confirming info session date and asking about dietary restrictions.",
    needsFollowUp: "No",
    promoted: false,
    leadId: "L-008",
    gender: "Female",
    ageGroup: "Middle School",
  },
  {
    id: "CL-009",
    referralDate: "2025-12-05",
    caller: "Susan Kim",
    candidate: "David Kim",
    phone: "(555) 890-1234",
    language: "Korean",
    mostRecentHistory: "2025-12-12",
    details:
      "12/5/2025 11:30 AM Sarah Williams - Return inquiry call. Called Susan Kim to discuss initial inquiry. Explained program options. Scheduled campus tour for Dec 12.",
    needsFollowUp: "Yes",
    promoted: false,
    leadId: "L-009",
    gender: "Male",
    ageGroup: "High School",
  },
  {
    id: "CL-010",
    referralDate: "2025-12-05",
    caller: "James Wilson",
    candidate: "Emma Wilson",
    phone: "(555) 901-2345",
    language: "English",
    mostRecentHistory: "2025-12-07",
    details:
      "12/5/2025 9:00 AM David Chen - Psychological evaluation scheduling. Email to James Wilson with three available time slots for psychological evaluation.",
    needsFollowUp: "Yes",
    promoted: false,
    leadId: "L-010",
    gender: "Female",
    ageGroup: "Young Adult",
  },
  {
    id: "CL-011",
    referralDate: "2025-12-04",
    caller: "Carmen Garcia",
    candidate: "Isabella Garcia",
    phone: "(555) 567-8901",
    language: "Spanish",
    mostRecentHistory: "2025-12-05",
    details:
      "12/4/2025 2:45 PM Sarah Williams - Attempted contact - no answer. Called Carmen Garcia - no answer. Third attempt this week. Left voicemail requesting return call.",
    needsFollowUp: "Yes",
    promoted: false,
    leadId: "L-016",
    gender: "Female",
    ageGroup: "High School",
  },
  {
    id: "CL-012",
    referralDate: "2025-12-04",
    caller: "Jennifer Thompson",
    candidate: "Noah Thompson",
    phone: "(555) 456-7890",
    language: "English",
    mostRecentHistory: "2025-12-11",
    details:
      "12/4/2025 10:15 AM David Chen - School records request. Sent formal records request to school district on behalf of Jennifer Thompson. Included release of information form.",
    needsFollowUp: "Yes",
    promoted: false,
    leadId: "L-015",
    gender: "Male",
    ageGroup: "Middle School",
  },
  {
    id: "CL-013",
    referralDate: "2025-12-04",
    caller: "Maria Jackson",
    candidate: "Tyler Jackson",
    phone: "(555) 012-3456",
    language: "English",
    mostRecentHistory: "2025-12-04",
    details:
      "12/4/2025 3:00 PM Sarah Williams - FPM notes discussion. In-person meeting with Maria Jackson to review Family Partnership Meeting notes. Discussed expectations and support services.",
    needsFollowUp: "No",
    promoted: false,
    leadId: "L-011",
    gender: "Male",
    ageGroup: "Young Adult",
  },
  {
    id: "CL-014",
    referralDate: "2025-12-03",
    caller: "Karen Robinson",
    candidate: "Mia Robinson",
    phone: "(555) 789-0123",
    language: "English",
    mostRecentHistory: "2025-12-04",
    details:
      "12/3/2025 1:30 PM Sarah Williams - Urgent: Staffing documentation. Urgent call about missing staffing notes with decision deadline approaching tomorrow. Guardian committed to completing by 5 PM.",
    needsFollowUp: "Yes",
    promoted: false,
    leadId: "L-018",
    gender: "Female",
    ageGroup: "High School",
  },
  {
    id: "CL-015",
    referralDate: "2025-12-03",
    caller: "Raj Patel",
    candidate: "Liam Patel",
    phone: "(555) 678-9012",
    language: "Hindi",
    mostRecentHistory: "2025-12-09",
    details:
      "12/3/2025 11:00 AM David Chen - Shadow day rescheduling. Video call with Raj Patel to reschedule shadow day (third reschedule). New date set for Dec 9.",
    needsFollowUp: "Yes",
    promoted: false,
    leadId: "L-017",
    gender: "Male",
    ageGroup: "Young Adult",
  },
  {
    id: "CL-016",
    referralDate: "2025-12-02",
    caller: "Thomas Harris",
    candidate: "Olivia Harris",
    phone: "(555) 123-4567",
    language: "English",
    mostRecentHistory: "2025-12-02",
    details:
      "12/2/2025 4:00 PM David Chen - Welcome packet delivery. Sent comprehensive welcome packet to Thomas Harris including program philosophy, daily schedule examples, FAQ document.",
    needsFollowUp: "No",
    promoted: false,
    leadId: "L-012",
    gender: "Female",
    ageGroup: "Middle School",
  },
  {
    id: "CL-017",
    referralDate: "2025-12-02",
    caller: "Ana Martinez",
    candidate: "Ethan Martinez",
    phone: "(555) 234-5678",
    language: "Spanish",
    mostRecentHistory: "2025-12-02",
    details:
      "12/2/2025 10:30 AM David Chen - Background check results. Called Ana Martinez to inform that background check results received and cleared. Discussed next steps in educational assessment.",
    needsFollowUp: "No",
    promoted: false,
    leadId: "L-013",
    gender: "Male",
    ageGroup: "High School",
  },
  {
    id: "CL-018",
    referralDate: "2025-12-01",
    caller: "Michael Anderson",
    candidate: "Sophia Anderson",
    phone: "(555) 345-6789",
    language: "English",
    mostRecentHistory: "2025-12-03",
    details:
      "12/1/2025 3:45 PM Sarah Williams - Medical exam completion confirmation. Text to Michael Anderson confirming receipt of medical exam results. Asked about preferred times for psych eval.",
    needsFollowUp: "Yes",
    promoted: false,
    leadId: "L-014",
    gender: "Female",
    ageGroup: "Young Adult",
  },
  {
    id: "CL-019",
    referralDate: "2025-12-01",
    caller: "Jane Doe",
    candidate: "John Doe",
    phone: "(555) 123-4567",
    language: "English",
    mostRecentHistory: "2025-12-05",
    details:
      "12/1/2025 9:00 AM Sarah Williams - Clinical form update notification. Email to Jane Doe acknowledging clinical form update. Clarified two sections that need additional information.",
    needsFollowUp: "Yes",
    promoted: false,
    leadId: "L-001",
    gender: "Male",
    ageGroup: "High School",
  },
  {
    id: "CL-020",
    referralDate: "2025-11-30",
    caller: "Emily Jones",
    candidate: "Mike Jones",
    phone: "(555) 456-7890",
    language: "English",
    mostRecentHistory: "2025-12-02",
    details:
      "11/30/2025 2:00 PM David Chen - Info session scheduling. Initial call to Emily Jones to schedule info session. Discussed program highlights and answered preliminary questions.",
    needsFollowUp: "No",
    promoted: false,
    leadId: "L-003",
    gender: "Male",
    ageGroup: "Young Adult",
  },
  {
    id: "CL-021",
    referralDate: "2025-11-28",
    caller: "Patricia Wong",
    candidate: "Kevin Wong",
    phone: "(555) 234-9876",
    language: "Cantonese",
    mostRecentHistory: "2025-11-28",
    details:
      "11/28/2025 3:15 PM Sarah Williams - Initial inquiry received. Patricia Wong called regarding residential program options for her son Kevin. Provided overview of Mercy Home and Bosco Home programs.",
    needsFollowUp: "Yes",
    promoted: false,
    gender: "Male",
    ageGroup: "Middle School",
  },
  {
    id: "CL-022",
    referralDate: "2025-11-27",
    caller: "Dr. Rachel Green",
    candidate: "Marcus Johnson",
    phone: "(555) 876-5432",
    language: "English",
    mostRecentHistory: "2025-11-29",
    details:
      "11/27/2025 10:00 AM David Chen - Professional referral. Dr. Green from Central Hospital referred Marcus Johnson. Discussed medical needs and program accommodations. Scheduled intake assessment.",
    needsFollowUp: "No",
    promoted: true,
    gender: "Male",
    ageGroup: "High School",
  },
  {
    id: "CL-023",
    referralDate: "2025-11-26",
    caller: "Angela Rivera",
    candidate: "Sofia Rivera",
    phone: "(555) 543-2109",
    language: "Spanish",
    mostRecentHistory: "2025-11-30",
    details:
      "11/26/2025 1:45 PM Sarah Williams - DCFS referral follow-up. Angela Rivera from DCFS referred Sofia Rivera. Emergency placement needed. Coordinated with admissions team for expedited review.",
    needsFollowUp: "Yes",
    promoted: true,
    gender: "Female",
    ageGroup: "Young Adult",
  },
  {
    id: "CL-024",
    referralDate: "2025-11-25",
    caller: "Mark Stevens",
    candidate: "Daniel Stevens",
    phone: "(555) 321-7654",
    language: "English",
    mostRecentHistory: "2025-11-25",
    details:
      "11/25/2025 9:30 AM David Chen - Website inquiry response. Mark Stevens submitted inquiry through website. Called to discuss program fit and scheduled virtual tour for next week.",
    needsFollowUp: "No",
    promoted: false,
    gender: "Male",
    ageGroup: "Middle School",
  },
  {
    id: "CL-025",
    referralDate: "2025-11-24",
    caller: "Linda Chen",
    candidate: "Jason Chen",
    phone: "(555) 654-3210",
    language: "Mandarin",
    mostRecentHistory: "2025-11-27",
    details:
      "11/24/2025 2:30 PM Sarah Williams - Interpreter arranged. Linda Chen requested Mandarin interpreter for info session. Arranged interpreter and confirmed session attendance for Dec 1.",
    needsFollowUp: "No",
    promoted: false,
    gender: "Male",
    ageGroup: "High School",
  },
];

// Helper functions
export const getContactLogsByCandidate = (
  candidateName: string,
) =>
  CONTACT_LOGS.filter((log) =>
    log.candidate
      .toLowerCase()
      .includes(candidateName.toLowerCase()),
  );

export const getContactLogsByCaller = (callerName: string) =>
  CONTACT_LOGS.filter((log) =>
    log.caller.toLowerCase().includes(callerName.toLowerCase()),
  );

export const getRecentContactLogs = (days: number = 7) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return CONTACT_LOGS.filter(
    (log) => new Date(log.referralDate) >= cutoffDate,
  );
};

export const getContactLogsNeedingFollowUp = () =>
  CONTACT_LOGS.filter((log) => log.needsFollowUp === "Yes");

export const getPromotedContactLogs = () =>
  CONTACT_LOGS.filter((log) => log.promoted === true);

export const getContactLogsByLanguage = (language: string) =>
  CONTACT_LOGS.filter((log) => log.language === language);

export const getContactLogsByDateRange = (
  startDate: string,
  endDate: string,
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return CONTACT_LOGS.filter((log) => {
    const logDate = new Date(log.referralDate);
    return logDate >= start && logDate <= end;
  });
};
/** Creates a Contact Log record from the New Contact Log dialog's submitted
 *  data (ContactLogDialogSLDS) — the one record-building path, used by the
 *  Contact Log page and the Global Actions "New Contact Log" (20004). */
export function addContactLogFromDialog(data: any): ContactLog {
  const callerFullName =
    `${data.callerFirstName} ${data.callerLastName}`.trim();
  const candidateFullName =
    data.candidateFirstName && data.candidateLastName
      ? `${data.candidateFirstName} ${data.candidateLastName}`.trim()
      : "N/A";
  const newLog: ContactLog = {
    id: `CL-${String(CONTACT_LOGS.length + 1).padStart(3, "0")}`,
    referralDate: data.contactDate,
    caller: callerFullName,
    candidate: candidateFullName,
    phone: data.callerPhone,
    language: data.language,
    details: `${data.contactType || "Contact"} - ${data.contactResult || "No result specified"}${data.notes ? "\n" + data.notes : ""}`,
    needsFollowUp: data.needsFollowUp ? "Yes" : "No",
    promoted: false,
    mostRecentHistory: localTodayIso(),
  };
  CONTACT_LOGS.unshift(newLog);
  return newLog;
}