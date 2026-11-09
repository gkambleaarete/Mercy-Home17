import { User, MessageCircle, Eye, Pill, FileText, AlertCircle } from "@/app/lib/lucide-icons";

// --- Mock Data for Programs List ---
export const MOCK_PROGRAMS = [
  {
    id: "prog-001",
    name: "Mahoney House",
    type: "Residential Treatment",
    status: "Active",
    census: "6/8",
    lastUpdate: "Just now",
    alerts: 2
  },
  {
    id: "prog-002",
    name: "Rydell House",
    type: "Independent Living",
    status: "Active",
    census: "4/5",
    lastUpdate: "15 mins ago",
    alerts: 0
  },
  {
    id: "prog-003",
    name: "Walsh Campus",
    type: "Day Program",
    status: "Active",
    census: "12/15",
    lastUpdate: "1 hour ago",
    alerts: 1
  }
];

// --- Mock Data for Detail View (Mahoney House) ---
export const YOUTH_STATUS = [
  { id: 1, name: "Fozzie Bear", initials: "FB", color: "bg-green-600", status: "Onground", program: "Mahoney House" },
  { id: 2, name: "Kermit the Frog", initials: "KF", color: "bg-green-600", status: "Onground", program: "Mahoney House" },
  { id: 3, name: "Red Fraggle", initials: "RF", color: "bg-green-600", status: "School", program: "Mahoney House" },
  { id: 4, name: "Miss Piggy", initials: "MP", color: "bg-gray-500", status: "Onground", program: "Mahoney House" },
  { id: 5, name: "Gonzo the Great", initials: "GG", color: "bg-gray-500", status: "Offground", program: "Mahoney House" },
  { id: 6, name: "Animal", initials: "AN", color: "bg-gray-500", status: "Onground", program: "Mahoney House" },
  { id: 7, name: "Scooter", initials: "SC", color: "bg-green-600", status: "Onground", program: "Mahoney House" },
  { id: 8, name: "Rowlf the Dog", initials: "RD", color: "bg-gray-500", status: "Pass", program: "Mahoney House" },
  { id: 9, name: "Rizzo the Rat", initials: "RR", color: "bg-green-600", status: "School", program: "Mahoney House" },
  { id: 10, name: "Pepe the Prawn", initials: "PP", color: "bg-gray-500", status: "Onground", program: "Mahoney House" }
];

export const PROGRAM_TEAM = [
  { id: 1, name: "Sarah Johnson", role: "Program Director", department: "Administration" },
  { id: 2, name: "Michael Chen", role: "Case Manager", department: "Social Services" },
  { id: 3, name: "Jessica Martinez", role: "Youth Counselor", department: "Direct Care" },
  { id: 4, name: "David Thompson", role: "Therapist", department: "Clinical Services" },
  { id: 5, name: "Amanda Wilson", role: "Nurse", department: "Medical" },
  { id: 6, name: "Robert Brown", role: "Education Coordinator", department: "Academic Support" },
  { id: 7, name: "Lisa Anderson", role: "Recreation Specialist", department: "Activities" },
  { id: 8, name: "James Taylor", role: "Overnight Supervisor", department: "Direct Care" }
];

export const OTHER_INDIVIDUALS = [
  { id: 1, name: "Parent/Guardian", category: "Family" },
  { id: 2, name: "Sibling", category: "Family" },
  { id: 3, name: "Extended Family Member", category: "Family" },
  { id: 4, name: "Probation Officer", category: "External Agency" },
  { id: 5, name: "DCFS Worker", category: "External Agency" },
  { id: 6, name: "School Representative", category: "Education" },
  { id: 7, name: "Attorney/Legal Representative", category: "Legal" },
  { id: 8, name: "Medical Provider", category: "Healthcare" },
  { id: 9, name: "Community Mentor", category: "Community" },
  { id: 10, name: "Volunteer", category: "Community" }
];

export const MY_TASKS = [
  { id: 1, text: "Parent Contact Red Fraggle", due: "6/25", completed: false, type: "task", assignedTo: "Jeremy Karpen", priority: "high" },
  { id: 2, text: "Med Error Report", due: "6/30", completed: false, type: "task", assignedTo: "Staff User", priority: "medium" },
  { id: 3, text: "ITP Red Fraggle", due: "7/01", completed: false, type: "task", assignedTo: "Jeremy Karpen", priority: "normal" }
];

export const PREVIOUS_SESSIONS = [
  { id: 1, name: "Advocate Meeting - 12/22/2025 2:00 PM (Scheduled)", date: "2025-12-22", time: "14:00", status: "scheduled", completed: false },
  { id: 2, name: "Advocate Meeting - 12/20/2025 10:30 AM (Scheduled)", date: "2025-12-20", time: "10:30", status: "scheduled", completed: false },
  { id: 3, name: "Advocate Meeting - 12/15/2025 3:15 PM (Completed)", date: "2025-12-15", time: "15:15", status: "completed", completed: true },
  { id: 4, name: "Advocate Meeting - 12/08/2025 1:00 PM (Completed)", date: "2025-12-08", time: "13:00", status: "completed", completed: true }
];

export const EVENTS = [
  { id: 1, title: "Tutoring", time: "7:00 PM", status: "CANCELED", youth: null, type: "event", date: "6/25" },
  { id: 2, title: "Care Planning Meeting", time: "7:30 PM", status: "Active", youth: "Fozzie", type: "event", date: "6/25" }
];

// Combined timeline items (tasks + events)
export const getTimelineItems = () => {
  const taskItems = MY_TASKS.map(task => ({
    ...task,
    type: "task" as const,
    timestamp: task.due,
    sortDate: new Date(task.due)
  }));
  
  const eventItems = EVENTS.map(event => ({
    ...event,
    type: "event" as const,
    timestamp: event.date,
    sortDate: new Date(event.date)
  }));
  
  return [...taskItems, ...eventItems].sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());
};

// Each entry represents one unique Youth + Medication + Dosing Period record for today.
// medicationId is a stable identifier for the scheduled record — used to deduplicate when
// counting dispensations and counts (a record can only contribute 0 or 1 per day regardless
// of how many Dispensation or Count Logs are submitted for it).
export const MEDICATIONS = [
  { period: "MORNING", entries: [
      { medicationId: 101, name: "Fozzie", status: "taken", counted: true },
      { medicationId: 102, name: "Kermit", status: "missed", counted: false }
    ]
  },
  { period: "AFTERNOON", entries: [
      { medicationId: 201, name: "Red", status: "taken", counted: false }
    ]
  },
  { period: "EVENING", entries: [
      { medicationId: 301, name: "Gonzo", status: "pending", counted: false }
    ]
  },
  { period: "BEDTIME", entries: [
      { medicationId: 401, name: "Fozzie", status: "pending", counted: false },
      { medicationId: 402, name: "Kermit", status: "pending", counted: false }
    ]
  }
];

// Program Log observation options — one list for the observation dialog and
// the log filter. "Pass Related" (20044) is appended after the existing
// options; it is just an observation value (no Pass record, no extra fields).
export const PROGRAM_LOG_OBSERVATIONS = [
  "Regulated Energy/Emotion",
  "Positive Peer Interaction",
  "Organized",
  "Shared Feelings",
  "Healthy Daily Routine",
  "Pass Related",
];

export const LOG_FEED = [
  {
    id: 1,
    author: "Jeremy Karpen",
    type: "Therapy",
    title: "logged a Therapy",
    time: "2:30 PM",
    date: new Date(),
    content: "Therapy session with Fozzie Bear. Therapist Office.",
    badges: ["Fozzie Bear"],
    icon: User,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
    comments: [
      {
        id: 1,
        author: "Sarah Mitchell",
        initials: "SM",
        content: "Great progress today! Did you discuss the family visit coming up?",
        timestamp: "2:45 PM",
        replies: [
          {
            id: 2,
            author: "Jeremy Karpen",
            initials: "JK",
            content: "Yes, he's feeling anxious but excited. We worked on some coping strategies.",
            timestamp: "3:10 PM"
          }
        ]
      },
      {
        id: 3,
        author: "Emily Neal",
        initials: "EN",
        content: "This is really helpful context for tonight's group session.",
        timestamp: "3:30 PM",
        replies: []
      }
    ]
  },
  {
    id: 2,
    author: "Joe Wronka",
    type: "Contact",
    title: "logged a Contact",
    time: "2:15 PM",
    date: new Date(),
    content: "Parent Contact with Jim Henson. Jim asked me to get Kermit the Frog to call home tonight after 7pm.",
    badges: ["Kermit the Frog", "Jim Henson"],
    suggestedAction: "Set reminder for 6:55 PM",
    icon: MessageCircle,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    comments: [
      {
        id: 4,
        author: "Matt Beran",
        initials: "MB",
        content: "I'll make sure he's available and has privacy for the call.",
        timestamp: "2:20 PM",
        replies: [
          {
            id: 5,
            author: "Joe Wronka",
            initials: "JW",
            content: "Perfect, thanks Matt! Dad mentioned they might want to video chat.",
            timestamp: "2:25 PM"
          },
          {
            id: 6,
            author: "Matt Beran",
            initials: "MB",
            content: "Good to know, I'll have the tablet ready just in case.",
            timestamp: "2:30 PM"
          }
        ]
      },
      {
        id: 7,
        author: "Elizabeth Sorice",
        initials: "ES",
        content: "Kermit mentioned he wanted to talk to his dad about the summer program. This is great timing.",
        timestamp: "4:15 PM",
        replies: []
      },
      {
        id: 8,
        author: "Sarah Mitchell",
        initials: "SM",
        content: "I'll note this in his care plan. Family engagement is improving!",
        timestamp: "5:00 PM",
        replies: []
      }
    ]
  },
  // Sample observations tagged Pass Related (20044), for the filter.
  {
    id: 101,
    author: "Joe Wronka",
    type: "Observation",
    title: "logged a Observation",
    time: "1:30 PM",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    content: "Observation of Miss Piggy. Location: Onground. Pass Related. Packed for weekend pass; checked in with staff before leaving.",
    badges: ["Miss Piggy"],
    observations: ["Pass Related"],
    icon: Eye,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    details: "Miss Piggy",
    comments: [],
  },
  {
    id: 102,
    author: "Jeremy Karpen",
    type: "Observation",
    title: "logged a Observation",
    time: "11:15 AM",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    content: "Observation of Gonzo the Great. Location: Onground. Positive Peer Interaction, Pass Related. Talked with peers about his upcoming day pass.",
    badges: ["Gonzo the Great"],
    observations: ["Positive Peer Interaction", "Pass Related"],
    icon: Eye,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    details: "Gonzo the Great",
    comments: [],
  },
  {
    id: 3,
    author: "Jeremy Karpen",
    type: "Observation",
    title: "logged a Observation",
    time: "2:00 PM",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    content: "Red Fraggle returned from school. Backpack checked. She has math homework and requested time to work with Elizabeth Sorice in the Learning Center tonight.",
    badges: [],
    icon: Eye,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    comments: [
      {
        id: 9,
        author: "Elizabeth Sorice",
        initials: "ES",
        content: "I'll be available from 7-8pm tonight. She's been doing really well with her math lately!",
        timestamp: "2:15 PM",
        replies: []
      },
      {
        id: 10,
        author: "Matt Beran",
        initials: "MB",
        content: "I noticed she seems more engaged with homework recently. Any insights?",
        timestamp: "3:00 PM",
        replies: [
          {
            id: 11,
            author: "Elizabeth Sorice",
            initials: "ES",
            content: "I think the one-on-one support is helping build her confidence. She's not as resistant anymore.",
            timestamp: "3:30 PM"
          }
        ]
      }
    ]
  },
  {
    id: 4,
    author: "Emily Neal",
    type: "Medical",
    title: "logged a Medical",
    time: "1:55 PM",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    content: "Medication Entry - Red Fraggle received Afternoon Medication, Tenex 2.5mg.",
    badges: ["Red Fraggle"],
    icon: Pill,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
    comments: [
      {
        id: 12,
        author: "Sarah Mitchell",
        initials: "SM",
        content: "Any side effects noted? She mentioned feeling tired yesterday.",
        timestamp: "2:00 PM",
        replies: [
          {
            id: 13,
            author: "Emily Neal",
            initials: "EN",
            content: "None today. I'll keep monitoring and document if anything changes.",
            timestamp: "2:10 PM"
          }
        ]
      }
    ]
  },
  {
    id: 5,
    author: "Matt Beran",
    type: "Admin",
    title: "logged a Admin",
    time: "1:55 PM",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    content: "Quarterly Testing - YRS Completed for Miss Piggy.",
    badges: ["Miss Piggy"],
    icon: FileText,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-100",
    comments: [
      {
        id: 14,
        author: "Jeremy Karpen",
        initials: "JK",
        content: "Do we have the results yet? I'd like to review before our next ITP meeting.",
        timestamp: "2:30 PM",
        replies: [
          {
            id: 15,
            author: "Matt Beran",
            initials: "MB",
            content: "Results should be in by Friday. I'll share them in the team meeting.",
            timestamp: "3:00 PM"
          }
        ]
      },
      {
        id: 16,
        author: "Sarah Mitchell",
        initials: "SM",
        content: "Thanks for getting this done on time, Matt!",
        timestamp: "4:00 PM",
        replies: []
      }
    ]
  },
  {
    id: 6,
    author: "Elizabeth Sorice",
    type: "Alert",
    title: "logged a Alert",
    time: "8:00 AM",
    date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    content: "Tutoring is canceled due to extreme heat. Please work with you in program and reach out with any youth-specific needs.",
    badges: ["All Youth"],
    icon: AlertCircle,
    iconColor: "text-red-600",
    iconBg: "bg-red-100",
    comments: [
      {
        id: 17,
        author: "Joe Wronka",
        initials: "JW",
        content: "Understood. I'll organize some indoor activities for this afternoon.",
        timestamp: "8:15 AM",
        replies: []
      },
      {
        id: 18,
        author: "Matt Beran",
        initials: "MB",
        content: "The rec room is available all afternoon if anyone needs it.",
        timestamp: "8:20 AM",
        replies: [
          {
            id: 19,
            author: "Joe Wronka",
            initials: "JW",
            content: "Perfect, I'll book it for 2-4pm for a game tournament.",
            timestamp: "8:25 AM"
          }
        ]
      }
    ]
  }
];