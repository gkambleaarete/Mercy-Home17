// --- Mock Data for Shift Handovers ---
// Helper function to generate dynamic dates
const generateDynamicDate = (daysAgo: number, time: string) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    dateString: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    time: time
  };
};

export const SHIFT_HANDOVERS = [
  {
    id: 1,
    shift: "Morning (7A - 3P)",
    date: generateDynamicDate(0, "3:00 PM").dateString,
    time: "3:00 PM",
    author: "Sarah Mitchell",
    role: "Lead Case Manager",
    timestamp: "3:00 PM",
    summary: `SHIFT SUMMARY - Mahoney House - Morning Shift

CRITICAL ALERTS:
• Heat Advisory in effect - All outdoor activities canceled including 7:00 PM tutoring session
• Kermit the Frog: Parent contact with Jim Henson - REQUIRES evening call home after 7:00 PM (reminder set for 6:55 PM)

YOUTH STATUS (6 residents):
• Onground: Fozzie Bear, Kermit the Frog, Miss Piggy, Animal (4)
• School: Red Fraggle (1)
• Offground: Gonzo the Great (1)

MEDICATION UPDATES:
• Morning: Kermit missed medication (flagged)
• Afternoon: Red Fraggle - Tenex 2.5mg administered successfully
• Pending: Gonzo (Evening), Fozzie & Kermit (Bedtime)

ACTIVITIES & SESSIONS:
• Therapy completed: Fozzie Bear session at 2:30 PM (Therapist Office)
• Academic: Red Fraggle has math homework, requested Learning Center time with Elizabeth Sorice tonight
• Quarterly Testing: YRS completed for Miss Piggy

RECOMMENDED ACTIONS FOR INCOMING SHIFT:
1. Ensure Kermit calls home after 7:00 PM per parent request
2. Monitor heat-related concerns and maintain hydration protocols
3. Support Red Fraggle's homework session in Learning Center
4. Complete pending evening/bedtime medication administration
5. Follow up on Kermit's missed morning medication`,
    criticalCount: 2,
    aiGenerated: true
  },
  {
    id: 2,
    shift: "Night (11P - 7A)",
    date: generateDynamicDate(0, "7:05 AM").dateString,
    time: "7:05 AM",
    author: "Marcus Johnson",
    role: "Night Supervisor",
    timestamp: "7:05 AM",
    summary: `OVERNIGHT SHIFT SUMMARY - Mahoney House

INCIDENTS: None reported

YOUTH STATUS:
• All 6 residents accounted for and safe
• Sleep check completed every 2 hours - all youth sleeping soundly
• No behavioral incidents or disturbances

MEDICATION:
• All bedtime medications administered successfully
• No missed doses

FACILITY:
• Routine safety checks completed
• All doors/windows secured
• No maintenance issues reported

NOTES:
• Quiet night overall
• Animal woke briefly at 3:15 AM for water, returned to bed without issue
• Morning staff briefed on heat advisory for today`,
    criticalCount: 0,
    aiGenerated: false
  },
  {
    id: 3,
    shift: "Afternoon (3P - 11P)",
    date: generateDynamicDate(1, "11:10 PM").dateString,
    time: "11:10 PM",
    author: "Jennifer Lee",
    role: "Program Coordinator",
    timestamp: "11:10 PM",
    summary: `EVENING SHIFT SUMMARY - Mahoney House

HIGHLIGHTS:
• All youth participated in evening recreational activities
• Successful group dinner - positive peer interactions noted
• Evening routine completed without issues

BEHAVIORAL NOTES:
• Fozzie Bear: Excellent mood, participated actively in group games
• Kermit: Completed homework, called family as scheduled
• Red Fraggle: Requested and received one-on-one time with staff

MEDICAL:
• All evening medications administered on time
• No health concerns reported

ACTIVITIES COMPLETED:
• Group game night (7:00-8:30 PM)
• Individual study time (6:00-7:00 PM)
• Evening hygiene routine (9:00-10:00 PM)

HANDOFF NOTES:
• All youth in bed by 10:45 PM
• Miss Piggy requested wake-up call at 6:30 AM for early appointment
• Gonzo has therapy session scheduled for 10:00 AM tomorrow`,
    criticalCount: 0,
    aiGenerated: false
  },
  {
    id: 4,
    shift: "Morning (7A - 3P)",
    date: generateDynamicDate(1, "3:05 PM").dateString,
    time: "3:05 PM",
    author: "David Park",
    role: "Case Manager",
    timestamp: "3:05 PM",
    summary: `MORNING SHIFT - Mahoney House

MORNING ROUTINE:
• All youth up and ready for school on time
• Breakfast served 7:30 AM - full participation
• Morning medications administered successfully

DEPARTURES:
• Red Fraggle: School (Returned 3:00 PM)
• Kermit: Outpatient therapy (Returned 11:30 AM)
• Fozzie Bear: School (Returned 2:45 PM)

ACTIVITIES:
• Miss Piggy: Art therapy session completed
• Gonzo: Individual case plan review with social worker
• Animal: Music therapy session scheduled

PARENT CONTACTS:
• Jim Henson called regarding Kermit's progress - positive conversation
• Red Fraggle's guardian confirmed weekend visit plans

NOTES FOR AFTERNOON SHIFT:
• Three youth will need homework support this evening
• Reminder: Weekly house meeting scheduled for 7:00 PM`,
    criticalCount: 0,
    aiGenerated: true
  },
  {
    id: 5,
    shift: "Night (11P - 7A)",
    date: generateDynamicDate(3, "7:10 AM").dateString,
    time: "7:10 AM",
    author: "Amanda Torres",
    role: "Night Supervisor",
    timestamp: "7:10 AM",
    summary: `OVERNIGHT SHIFT SUMMARY - Mahoney House

INCIDENTS: None reported

YOUTH STATUS:
• All 6 residents accounted for and safe
• Sleep checks completed at 1:00 AM, 3:00 AM, and 5:00 AM
• All youth sleeping peacefully throughout the night

MEDICATION:
• All bedtime medications administered without issues
• No emergency medications needed

BEHAVIORAL NOTES:
• Fozzie Bear woke at 2:30 AM with nightmare - staff provided comfort, returned to sleep by 2:45 AM
• All other youth remained asleep entire shift

FACILITY:
• Routine safety inspections completed
• All security systems functioning properly
• Temperature maintained at comfortable levels

HANDOFF NOTES:
• Quiet and uneventful night
• All youth should be well-rested for morning activities
• Recommend checking in with Fozzie about nightmare during morning routine`,
    criticalCount: 0,
    aiGenerated: false
  },
  {
    id: 6,
    shift: "Afternoon (3P - 11P)",
    date: generateDynamicDate(5, "11:15 PM").dateString,
    time: "11:15 PM",
    author: "Michael Rodriguez",
    role: "Program Coordinator",
    timestamp: "11:15 PM",
    summary: `EVENING SHIFT SUMMARY - Mahoney House

CRITICAL ALERTS:
• Red Fraggle: Minor scraped knee during outdoor basketball - first aid administered, parent/guardian notified

YOUTH STATUS (6 residents):
• All onground for entire shift
• Positive engagement in planned activities
• Evening routine completed successfully

MEDICATION UPDATES:
• Evening medications: All administered on schedule
• Red Fraggle received pain relief (Tylenol) for scraped knee at 5:45 PM

ACTIVITIES & SESSIONS:
• Outdoor recreation: Basketball and soccer (4:00-5:30 PM)
• Group dinner: Pizza night - 100% participation
• Life skills workshop: Budgeting basics (7:00-8:00 PM)
• Free time/recreation (8:00-9:30 PM)

BEHAVIORAL HIGHLIGHTS:
• Animal: Demonstrated excellent sportsmanship during basketball
• Kermit: Took leadership role in life skills workshop
• Miss Piggy: Helped with dinner setup and cleanup voluntarily

RECOMMENDED ACTIONS FOR INCOMING SHIFT:
1. Continue monitoring Red Fraggle's knee - reapply bandage if needed
2. All youth tucked in and ready for sleep by 11:00 PM
3. Kermit has early appointment tomorrow - ensure 6:45 AM wake-up`,
    criticalCount: 1,
    aiGenerated: true
  },
  {
    id: 7,
    shift: "Morning (7A - 3P)",
    date: generateDynamicDate(10, "3:10 PM").dateString,
    time: "3:10 PM",
    author: "Patricia Chen",
    role: "Lead Case Manager",
    timestamp: "3:10 PM",
    summary: `MORNING SHIFT SUMMARY - Mahoney House

MORNING ROUTINE:
• All youth awake by 7:15 AM
• Breakfast completed 7:30-8:15 AM
• Morning medications administered to all who need them

DEPARTURES & ACTIVITIES:
• School departures: Red Fraggle, Fozzie Bear, Kermit (all returned by 2:45 PM)
• Gonzo: Therapy session at community center 10:00 AM-11:30 AM
• Miss Piggy: Academic tutoring session completed
• Animal: Individual counseling session with Dr. Martinez

PARENT/GUARDIAN CONTACTS:
• Fozzie Bear's mother called - discussed upcoming family therapy session
• Red Fraggle's caseworker visited for monthly check-in
• Gonzo's guardian confirmed attendance at IEP meeting next week

MEDICAL NOTES:
• All morning medications administered successfully
• No health concerns reported
• Red Fraggle's knee from yesterday healing well, bandage changed

HIGHLIGHTS:
• Excellent school attendance - 100% on time
• Positive peer interactions during breakfast
• All scheduled appointments attended without issues

HANDOFF TO AFTERNOON SHIFT:
• All youth accounted for and onground
• Homework due tonight for Red, Fozzie, and Kermit
• Reminder: Weekly community meeting at 6:00 PM`,
    criticalCount: 0,
    aiGenerated: false
  }
];

// --- Mock Data for Behavioral Analysis ---
export const BEHAVIORAL_INCIDENTS = [
  {
    id: 1,
    date: "June 25, 2024",
    time: "1:45 PM",
    youth: "Gonzo the Great",
    type: "Verbal Outburst",
    severity: "Low",
    description: "Raised voice during group activity when losing a game. Staff intervened, youth calmed within 5 minutes.",
    intervention: "Verbal redirection, brief check-in",
    outcome: "Positive - Youth apologized and rejoined activity",
    staff: "Jeremy Karpen"
  },
  {
    id: 2,
    date: "June 24, 2024",
    time: "4:30 PM",
    youth: "Animal",
    type: "Property Damage",
    severity: "Medium",
    description: "Knocked over lamp in common area during rough play. No injuries. Lamp shade damaged.",
    intervention: "Time-out, restorative conversation, assigned cleaning duty",
    outcome: "Youth accepted responsibility, completed repairs",
    staff: "Jennifer Lee"
  },
  {
    id: 3,
    date: "June 23, 2024",
    time: "7:15 PM",
    youth: "Miss Piggy",
    type: "Peer Conflict",
    severity: "Low",
    description: "Verbal disagreement with Red Fraggle over TV remote. Brief argument, no physical contact.",
    intervention: "Mediation session, conflict resolution discussion",
    outcome: "Both youth agreed to sharing schedule",
    staff: "Sarah Mitchell"
  },
  {
    id: 4,
    date: "June 22, 2024",
    time: "2:00 PM",
    youth: "Kermit the Frog",
    type: "Refusal to Comply",
    severity: "Low",
    description: "Initially refused to complete assigned chores. Expressed frustration about school stress.",
    intervention: "One-on-one conversation, break offered, modified chore schedule",
    outcome: "Youth completed tasks after 20-minute break",
    staff: "David Park"
  }
];

export const BEHAVIORAL_SUMMARY = {
  weeklyTrends: {
    totalIncidents: 4,
    avgPerDay: 0.57,
    comparedToLastWeek: -2,
    mostCommonType: "Verbal Outburst",
    peakTime: "Afternoon (3PM-6PM)"
  },
  youthBreakdown: [
    { 
      name: "Fozzie Bear", 
      incidents: 0, 
      trend: "stable", 
      color: "bg-green-600",
      lastIncident: "3 weeks ago",
      interventionPlan: "Maintain current behavioral support plan",
      recentHistory: [
        { date: "Jun 24", type: "Observation", note: "Participated actively in group therapy, showed empathy to peers" },
        { date: "Jun 22", type: "Achievement", note: "Completed all assigned chores without prompting" },
        { date: "Jun 20", type: "Observation", note: "Helped new resident acclimate to house routines" }
      ],
      strengths: ["Peer leadership", "Emotional regulation", "Task completion"],
      goals: ["Continue mentoring newer residents", "Maintain zero incident streak"]
    },
    { 
      name: "Kermit the Frog", 
      incidents: 1, 
      trend: "improving", 
      color: "bg-green-600",
      lastIncident: "2 days ago",
      interventionPlan: "Brief verbal redirects, positive reinforcement",
      recentHistory: [
        { date: "Jun 25", type: "Incident", severity: "Low", note: "Verbal disagreement with peer during game time, de-escalated quickly" },
        { date: "Jun 23", type: "Achievement", note: "Asked staff for help instead of escalating frustration" },
        { date: "Jun 21", type: "Observation", note: "Used coping skills independently during stress" }
      ],
      strengths: ["Self-advocacy", "Coping skills", "Therapy engagement"],
      goals: ["Practice conflict resolution skills", "Increase frustration tolerance"]
    },
    { 
      name: "Red Fraggle", 
      incidents: 0, 
      trend: "stable", 
      color: "bg-green-600",
      lastIncident: "5 weeks ago",
      interventionPlan: "Continue structured support, maintain routine",
      recentHistory: [
        { date: "Jun 25", type: "Achievement", note: "Completed all homework assignments independently" },
        { date: "Jun 23", type: "Observation", note: "Demonstrated excellent peer support during group activities" },
        { date: "Jun 21", type: "Achievement", note: "Volunteered to help with community service project" }
      ],
      strengths: ["Academic focus", "Peer support", "Community engagement"],
      goals: ["Develop leadership skills", "Prepare for educational transition"]
    },
    { 
      name: "Miss Piggy", 
      incidents: 1, 
      trend: "stable", 
      color: "bg-yellow-600",
      lastIncident: "4 days ago",
      interventionPlan: "Social skills coaching, emotion regulation support",
      recentHistory: [
        { date: "Jun 23", type: "Incident", severity: "Low", note: "Expressed frustration loudly when asked to wait turn, responded to staff redirection" },
        { date: "Jun 22", type: "Observation", note: "Participated appropriately in group activity" },
        { date: "Jun 20", type: "Achievement", note: 'Used "I feel" statements during conflict' }
      ],
      strengths: ["Self-expression", "Following structure", "Therapy participation"],
      goals: ["Improve impulse control", "Practice waiting/turn-taking"]
    },
    { 
      name: "Gonzo the Great", 
      incidents: 1, 
      trend: "stable", 
      color: "bg-yellow-600",
      lastIncident: "3 days ago",
      interventionPlan: "Safety planning, impulse control strategies",
      recentHistory: [
        { date: "Jun 24", type: "Incident", severity: "Low", note: "Attempted unsafe stunt, responded well to safety redirection" },
        { date: "Jun 23", type: "Achievement", note: "Asked permission before trying new activity" },
        { date: "Jun 21", type: "Observation", note: "Engaged appropriately in structured recreation" }
      ],
      strengths: ["Creativity", "Accepts feedback", "Energetic participation"],
      goals: ["Improve safety awareness", "Think before acting"]
    },
    { 
      name: "Animal", 
      incidents: 1, 
      trend: "improving", 
      color: "bg-yellow-600",
      lastIncident: "1 day ago",
      interventionPlan: "Sensory breaks, calming strategies, movement opportunities",
      recentHistory: [
        { date: "Jun 25", type: "Incident", severity: "Low", note: "Difficulty regulating during transition time, used calming corner successfully" },
        { date: "Jun 23", type: "Achievement", note: "Asked for sensory break before escalating" },
        { date: "Jun 21", type: "Observation", note: "Participated in group activity with appropriate energy level" }
      ],
      strengths: ["High energy", "Responsive to interventions", "Music therapy engagement"],
      goals: ["Recognize early signs of dysregulation", "Use calming strategies independently"]
    }
  ]
};