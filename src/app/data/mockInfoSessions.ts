export interface Participant {
  id: number;
  name: string;
  email: string;
  phone: string;
  attendance: "Present" | "Absent" | null;
}

export interface InfoSession {
  id: number;
  date: string;
  time: string;
  topic: string;
  location: string;
  facilitator: string;
  attendees: number;
  capacity: number;
  status: "Scheduled" | "Completed" | "Cancelled" | "";
  endDate?: string;
  endTime?: string;
  homeVisit?: boolean;
  serviceCoordination?: boolean;
  participants?: Participant[];
}

export const INFO_SESSIONS: InfoSession[] = [
  // ============================================
  // TODAY - APRIL 29, 2026 (for Daily view)
  // ============================================
  {
    id: 200,
    date: "2026-04-29",
    time: "9:00 AM",
    topic: "New Family Orientation & Program Overview",
    location: "Main Conference Room",
    facilitator: "Maria Rodriguez, Program Director",
    attendees: 0,
    capacity: 20,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true,
    participants: [
      { id: 1, name: "John Smith", email: "john.smith@example.com", phone: "(555) 123-4567", attendance: null },
      { id: 2, name: "Sarah Johnson", email: "sarah.j@example.com", phone: "(555) 234-5678", attendance: null },
      { id: 3, name: "Michael Brown", email: "m.brown@example.com", phone: "(555) 345-6789", attendance: null }
    ]
  },
  {
    id: 201,
    date: "2026-04-29",
    time: "11:30 AM",
    topic: "Spring Programs & Summer Camp Planning",
    location: "Recreation Center",
    facilitator: "Lisa Martinez, Recreation Therapist",
    attendees: 0,
    capacity: 25,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: false,
    participants: [
      { id: 4, name: "Emily Davis", email: "emily.davis@example.com", phone: "(555) 456-7890", attendance: null },
      { id: 5, name: "Robert Wilson", email: "r.wilson@example.com", phone: "(555) 567-8901", attendance: null }
    ]
  },
  {
    id: 202,
    date: "2026-04-29",
    time: "2:00 PM",
    topic: "Mental Health Services & Clinical Support",
    location: "Clinical Services Wing",
    facilitator: "Dr. Patricia Lee, Chief Psychiatrist",
    attendees: 0,
    capacity: 15,
    status: "",
    homeVisit: false,
    serviceCoordination: true,
    participants: [
      { id: 6, name: "Jessica Martinez", email: "j.martinez@example.com", phone: "(555) 678-9012", attendance: null }
    ]
  },
  {
    id: 203,
    date: "2026-04-29",
    time: "4:00 PM",
    topic: "Evening Family Q&A Session",
    location: "Community Room",
    facilitator: "David Martinez, LCSW",
    attendees: 0,
    capacity: 30,
    status: "Scheduled",
    homeVisit: true,
    serviceCoordination: false
  },

  // ============================================
  // THIS WEEK (April 27 - May 3, 2026)
  // ============================================
  {
    id: 204,
    date: "2026-04-27",
    time: "10:00 AM",
    topic: "Weekend Family Engagement Activities",
    location: "Family Services Building",
    facilitator: "Jennifer Garcia, Family Support Specialist",
    attendees: 0,
    capacity: 20,
    status: "Scheduled",
    homeVisit: true,
    serviceCoordination: true
  },
  {
    id: 205,
    date: "2026-04-28",
    time: "9:30 AM",
    topic: "Educational Services & Academic Planning",
    location: "Education Center",
    facilitator: "Michael Brown, Education Coordinator",
    attendees: 0,
    capacity: 18,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 206,
    date: "2026-04-28",
    time: "2:00 PM",
    topic: "Therapeutic Recreation Programs",
    location: "Recreation Center",
    facilitator: "Lisa Martinez, Recreation Therapist",
    attendees: 0,
    capacity: 25,
    status: "Scheduled"
  },
  {
    id: 207,
    date: "2026-04-30",
    time: "10:30 AM",
    topic: "Behavioral Health & Counseling Services",
    location: "Clinical Services Wing",
    facilitator: "Coach Williams, Behavior Specialist",
    attendees: 0,
    capacity: 15,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 208,
    date: "2026-05-01",
    time: "9:00 AM",
    topic: "May Day Celebration & Spring Activities",
    location: "Community Room",
    facilitator: "Carmen Ruiz, Diversity Coordinator",
    attendees: 0,
    capacity: 35,
    status: "Scheduled"
  },
  {
    id: 209,
    date: "2026-05-01",
    time: "1:00 PM",
    topic: "Youth Leadership Development Workshop",
    location: "Main Conference Room",
    facilitator: "Marcus Johnson, Community Liaison",
    attendees: 0,
    capacity: 20,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 210,
    date: "2026-05-02",
    time: "10:00 AM",
    topic: "Family Support & Parenting Resources",
    location: "Family Services Building",
    facilitator: "Jennifer Garcia, Family Support Specialist",
    attendees: 0,
    capacity: 16,
    status: "Scheduled",
    homeVisit: true,
    serviceCoordination: false
  },

  // ============================================
  // THIS MONTH - APRIL 2026 (for Monthly view)
  // ============================================
  {
    id: 211,
    date: "2026-04-01",
    time: "10:00 AM",
    topic: "April Program Kickoff & New Initiatives",
    location: "Main Conference Room",
    facilitator: "Maria Rodriguez, Program Director",
    attendees: 0,
    capacity: 30,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 212,
    date: "2026-04-03",
    time: "2:00 PM",
    topic: "Spring Assessment & Evaluation Session",
    location: "Clinical Services Wing",
    facilitator: "Dr. James Wilson, Clinical Director",
    attendees: 0,
    capacity: 15,
    status: "Completed"
  },
  {
    id: 213,
    date: "2026-04-08",
    time: "9:30 AM",
    topic: "Spring Wellness & Outdoor Activities",
    location: "Recreation Center",
    facilitator: "Lisa Martinez, Recreation Therapist",
    attendees: 0,
    capacity: 25,
    status: "Completed"
  },
  {
    id: 214,
    date: "2026-04-10",
    time: "11:00 AM",
    topic: "Parent-Teen Communication Workshop",
    location: "Family Services Building",
    facilitator: "David Martinez, LCSW",
    attendees: 0,
    capacity: 18,
    status: "Completed",
    homeVisit: true,
    serviceCoordination: false
  },
  {
    id: 215,
    date: "2026-04-15",
    time: "10:00 AM",
    topic: "Crisis Intervention & Safety Planning",
    location: "Main Conference Room",
    facilitator: "Dr. Kevin Park, Crisis Specialist",
    attendees: 0,
    capacity: 20,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 216,
    date: "2026-04-17",
    time: "1:30 PM",
    topic: "Academic Success Strategies Workshop",
    location: "Education Center",
    facilitator: "Michael Brown, Education Coordinator",
    attendees: 0,
    capacity: 20,
    status: "Completed"
  },
  {
    id: 217,
    date: "2026-04-21",
    time: "9:00 AM",
    topic: "Earth Week Environmental Activities",
    location: "Community Outreach Center",
    facilitator: "Marcus Johnson, Community Liaison",
    attendees: 0,
    capacity: 25,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 218,
    date: "2026-04-22",
    time: "2:00 PM",
    topic: "Earth Day Special Event & Celebration",
    location: "Recreation Center",
    facilitator: "Carmen Ruiz, Diversity Coordinator",
    attendees: 0,
    capacity: 40,
    status: "Completed"
  },
  {
    id: 219,
    date: "2026-04-24",
    time: "10:30 AM",
    topic: "Spring Break Safety & Activities Recap",
    location: "Main Conference Room",
    facilitator: "Sarah Chen, Residential Manager",
    attendees: 20,
    capacity: 22,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 104,
    date: "2026-04-07",
    time: "10:00 AM",
    topic: "Youth Empowerment & Leadership Forum",
    location: "Main Conference Room",
    facilitator: "Marcus Johnson, Community Liaison",
    attendees: 24,
    capacity: 25,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 105,
    date: "2026-04-14",
    time: "1:30 PM",
    topic: "Earth Month Environmental Stewardship",
    location: "Community Outreach Center",
    facilitator: "Marcus Johnson, Community Liaison",
    attendees: 18,
    capacity: 20,
    status: "Completed"
  },

  // ============================================
  // FEBRUARY 2026 SESSIONS (Legacy data)
  // ============================================
  {
    id: 110,
    date: "2026-02-27",
    time: "9:00 AM",
    topic: "Morning Individual Info Session",
    location: "Main Conference Room",
    facilitator: "Maria Rodriguez, Program Director",
    attendees: 0,
    capacity: 20,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true,
    participants: [
      { id: 1, name: "John Smith", email: "john.smith@example.com", phone: "(555) 123-4567", attendance: null },
      { id: 2, name: "Sarah Johnson", email: "sarah.j@example.com", phone: "(555) 234-5678", attendance: null },
      { id: 3, name: "Michael Brown", email: "m.brown@example.com", phone: "(555) 345-6789", attendance: null }
    ]
  },
  {
    id: 111,
    date: "2026-02-27",
    time: "11:30 AM",
    topic: "Family Support Services Overview",
    location: "Family Services Building",
    facilitator: "Jennifer Garcia, Family Support Specialist",
    attendees: 0,
    capacity: 15,
    status: "Completed",
    homeVisit: true,
    serviceCoordination: false,
    participants: [
      { id: 4, name: "Emily Davis", email: "emily.davis@example.com", phone: "(555) 456-7890", attendance: "Present" },
      { id: 5, name: "Robert Wilson", email: "r.wilson@example.com", phone: "(555) 567-8901", attendance: "Present" }
    ]
  },
  {
    id: 112,
    date: "2026-02-27",
    time: "2:00 PM",
    topic: "Clinical Assessment & Evaluation Process",
    location: "Clinical Services Wing",
    facilitator: "Dr. James Wilson, Clinical Director",
    attendees: 0,
    capacity: 12,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true,
    participants: [
      { id: 6, name: "Jessica Martinez", email: "j.martinez@example.com", phone: "(555) 678-9012", attendance: null }
    ]
  },
  {
    id: 113,
    date: "2026-02-27",
    time: "4:00 PM",
    topic: "Evening Family Q&A Session",
    location: "Community Room",
    facilitator: "Sarah Chen, Residential Manager",
    attendees: 0,
    capacity: 25,
    status: "Completed"
  },

  // ============================================
  // FEBRUARY 24-28, 2026 (Past sessions - Completed)
  // ============================================
  {
    id: 114,
    date: "2026-02-24",
    time: "10:00 AM",
    topic: "Educational Services & Academic Support",
    location: "Education Center",
    facilitator: "Michael Brown, Education Coordinator",
    attendees: 18,
    capacity: 20,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 115,
    date: "2026-02-24",
    time: "2:30 PM",
    topic: "Therapeutic Recreation Programs Overview",
    location: "Recreation Center",
    facilitator: "Lisa Martinez, Recreation Therapist",
    attendees: 16,
    capacity: 18,
    status: "Completed"
  },
  {
    id: 116,
    date: "2026-02-25",
    time: "9:30 AM",
    topic: "Behavioral Health Services Introduction",
    location: "Clinical Services Wing",
    facilitator: "Coach Williams, Behavior Specialist",
    attendees: 14,
    capacity: 15,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 117,
    date: "2026-02-25",
    time: "1:00 PM",
    topic: "Crisis Intervention & Safety Planning",
    location: "Main Conference Room",
    facilitator: "Dr. Kevin Park, Crisis Specialist",
    attendees: 19,
    capacity: 20,
    status: "Completed"
  },
  {
    id: 118,
    date: "2026-02-26",
    time: "10:30 AM",
    topic: "Parent-Teen Communication Workshop",
    location: "Family Services Building",
    facilitator: "David Martinez, LCSW",
    attendees: 15,
    capacity: 16,
    status: "Completed",
    homeVisit: true,
    serviceCoordination: false
  },
  {
    id: 119,
    date: "2026-02-26",
    time: "3:00 PM",
    topic: "Medical Services & Health Monitoring",
    location: "Medical Clinic",
    facilitator: "Dr. Emily Thompson, Medical Director",
    attendees: 11,
    capacity: 12,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 120,
    date: "2026-02-28",
    time: "9:00 AM",
    topic: "Weekend Programming & Activities",
    location: "Recreation Center",
    facilitator: "Lisa Martinez, Recreation Therapist",
    attendees: 28,
    capacity: 30,
    status: "Completed"
  },
  {
    id: 121,
    date: "2026-02-28",
    time: "11:00 AM",
    topic: "Alumni Success Stories & Mentorship",
    location: "Community Room",
    facilitator: "Robert Anderson, Alumni Coordinator",
    attendees: 23,
    capacity: 25,
    status: "Completed"
  },

  // ============================================
  // REST OF 2026 (for Monthly/Yearly views)
  // ============================================
  {
    id: 122,
    date: "2026-05-05",
    time: "10:00 AM",
    topic: "Spring Mental Health Awareness Series",
    location: "Clinical Services Wing",
    facilitator: "Dr. Patricia Lee, Chief Psychiatrist",
    attendees: 0,
    capacity: 25,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 123,
    date: "2026-05-19",
    time: "2:00 PM",
    topic: "Summer Camp & Activity Planning",
    location: "Recreation Center",
    facilitator: "Lisa Martinez, Recreation Therapist",
    attendees: 0,
    capacity: 30,
    status: "Scheduled"
  },
  {
    id: 124,
    date: "2026-06-08",
    time: "9:30 AM",
    topic: "Youth Leadership Development Program",
    location: "Main Conference Room",
    facilitator: "Marcus Johnson, Community Liaison",
    attendees: 0,
    capacity: 20,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 125,
    date: "2026-06-22",
    time: "11:00 AM",
    topic: "Summer Transition Support for Families",
    location: "Family Services Building",
    facilitator: "Jennifer Garcia, Family Support Specialist",
    attendees: 0,
    capacity: 18,
    status: "Scheduled",
    homeVisit: true,
    serviceCoordination: false
  },
  {
    id: 126,
    date: "2026-07-10",
    time: "10:00 AM",
    topic: "Mid-Year Program Review & Updates",
    location: "Main Conference Room",
    facilitator: "Maria Rodriguez, Program Director",
    attendees: 0,
    capacity: 25,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 127,
    date: "2026-07-24",
    time: "1:30 PM",
    topic: "Summer Safety & Wellness Workshop",
    location: "Recreation Center",
    facilitator: "Dr. Emily Thompson, Medical Director",
    attendees: 0,
    capacity: 20,
    status: "Scheduled"
  },
  {
    id: 128,
    date: "2026-08-07",
    time: "9:00 AM",
    topic: "Back-to-School Preparation Series",
    location: "Education Center",
    facilitator: "Michael Brown, Education Coordinator",
    attendees: 0,
    capacity: 22,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 129,
    date: "2026-08-21",
    time: "2:00 PM",
    topic: "Fall Academic Goal Setting",
    location: "Education Center",
    facilitator: "Michael Brown, Education Coordinator",
    attendees: 0,
    capacity: 18,
    status: "Scheduled"
  },
  {
    id: 130,
    date: "2026-09-04",
    time: "10:30 AM",
    topic: "Fall Program Launch & New Initiatives",
    location: "Main Conference Room",
    facilitator: "Maria Rodriguez, Program Director",
    attendees: 0,
    capacity: 30,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 131,
    date: "2026-09-18",
    time: "11:00 AM",
    topic: "Cultural Heritage Month Celebration",
    location: "Community Room",
    facilitator: "Carmen Ruiz, Diversity Coordinator",
    attendees: 0,
    capacity: 35,
    status: "Scheduled"
  },
  {
    id: 132,
    date: "2026-10-02",
    time: "9:00 AM",
    topic: "Mental Health Awareness Month Activities",
    location: "Clinical Services Wing",
    facilitator: "Dr. James Wilson, Clinical Director",
    attendees: 0,
    capacity: 20,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 133,
    date: "2026-10-16",
    time: "2:30 PM",
    topic: "Halloween Safety & Celebration Planning",
    location: "Recreation Center",
    facilitator: "Lisa Martinez, Recreation Therapist",
    attendees: 0,
    capacity: 25,
    status: "Scheduled"
  },
  {
    id: 134,
    date: "2026-11-06",
    time: "10:00 AM",
    topic: "Gratitude & Thanksgiving Family Workshop",
    location: "Family Services Building",
    facilitator: "Jennifer Garcia, Family Support Specialist",
    attendees: 0,
    capacity: 20,
    status: "Scheduled",
    homeVisit: true,
    serviceCoordination: false
  },
  {
    id: 135,
    date: "2026-11-20",
    time: "1:00 PM",
    topic: "Year-End Academic Progress Reviews",
    location: "Education Center",
    facilitator: "Michael Brown, Education Coordinator",
    attendees: 0,
    capacity: 16,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 136,
    date: "2026-12-04",
    time: "9:30 AM",
    topic: "Holiday Season Family Support Services",
    location: "Main Conference Room",
    facilitator: "Sarah Chen, Residential Manager",
    attendees: 0,
    capacity: 30,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 137,
    date: "2026-12-18",
    time: "11:00 AM",
    topic: "Winter Break Programming & Safety",
    location: "Recreation Center",
    facilitator: "Lisa Martinez, Recreation Therapist",
    attendees: 0,
    capacity: 28,
    status: "Scheduled"
  },

  // ============================================
  // MARCH 2026 (Past sessions - Completed)
  // ============================================
  {
    id: 100,
    date: "2026-03-03",
    time: "10:00 AM",
    topic: "Spring Transition & New Program Offerings",
    location: "Main Conference Room",
    facilitator: "Maria Rodriguez, Program Director",
    attendees: 23,
    capacity: 25,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 101,
    date: "2026-03-10",
    time: "2:00 PM",
    topic: "Trauma-Informed Parenting Workshop",
    location: "Family Services Building",
    facilitator: "David Martinez, LCSW",
    attendees: 18,
    capacity: 20,
    status: "Completed",
    homeVisit: true,
    serviceCoordination: false
  },
  {
    id: 102,
    date: "2026-03-17",
    time: "9:30 AM",
    topic: "St. Patrick's Day Cultural Event",
    location: "Community Room",
    facilitator: "Carmen Ruiz, Diversity Coordinator",
    attendees: 32,
    capacity: 35,
    status: "Completed"
  },
  {
    id: 103,
    date: "2026-03-24",
    time: "11:00 AM",
    topic: "Spring Break Safety & Activity Planning",
    location: "Recreation Center",
    facilitator: "Lisa Martinez, Recreation Therapist",
    attendees: 27,
    capacity: 30,
    status: "Completed"
  },

  // ============================================
  // NEXT WEEK (February 16-20, 2026)
  // ============================================
  {
    id: 90,
    date: "2026-02-16",
    time: "10:00 AM",
    topic: "Presidents' Day Family History Activity",
    location: "Community Room",
    facilitator: "Carmen Ruiz, Diversity Coordinator",
    attendees: 0,
    capacity: 25,
    status: "Scheduled"
  },
  {
    id: 91,
    date: "2026-02-17",
    time: "2:00 PM",
    topic: "Clinical Progress Reviews & Updates",
    location: "Clinical Services Wing",
    facilitator: "Dr. James Wilson, Clinical Director",
    attendees: 0,
    capacity: 15,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 92,
    date: "2026-02-19",
    time: "9:00 AM",
    topic: "Family Engagement & Volunteering Opportunities",
    location: "Family Services Building",
    facilitator: "Jennifer Garcia, Family Support Specialist",
    attendees: 0,
    capacity: 20,
    status: "Scheduled",
    homeVisit: true,
    serviceCoordination: false
  },
  {
    id: 93,
    date: "2026-02-20",
    time: "11:00 AM",
    topic: "Academic Mid-Term Preparation Workshop",
    location: "Education Center",
    facilitator: "Michael Brown, Education Coordinator",
    attendees: 0,
    capacity: 18,
    status: "Scheduled"
  },

  // ============================================
  // THIS WEEK (February 8-14, 2026)
  // ============================================
  {
    id: 80,
    date: "2026-02-09",
    time: "10:00 AM",
    topic: "Weekly Residential Check-In & Updates",
    location: "Residential Hall A",
    facilitator: "Sarah Chen, Residential Manager",
    attendees: 16,
    capacity: 20,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 81,
    date: "2026-02-10",
    time: "9:30 AM",
    topic: "Youth Mentorship Program Kickoff",
    location: "Main Conference Room",
    facilitator: "Maria Rodriguez, Program Director",
    attendees: 12,
    capacity: 25,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 82,
    date: "2026-02-10",
    time: "2:00 PM",
    topic: "Grief & Loss Support Group Introduction",
    location: "Clinical Services Wing",
    facilitator: "Dr. Patricia Lee, Chief Psychiatrist",
    attendees: 0,
    capacity: 15,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: false
  },
  {
    id: 83,
    date: "2026-02-11",
    time: "10:30 AM",
    topic: "Art Therapy & Creative Expression Workshop",
    location: "Recreation Center",
    facilitator: "Lisa Martinez, Recreation Therapist",
    attendees: 0,
    capacity: 20,
    status: "Scheduled"
  },
  {
    id: 84,
    date: "2026-02-12",
    time: "1:00 PM",
    topic: "Peer Mediation Training for Youth",
    location: "Training Room B",
    facilitator: "Coach Williams, Behavior Specialist",
    attendees: 0,
    capacity: 15,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 85,
    date: "2026-02-13",
    time: "11:00 AM",
    topic: "Valentine's Day Healthy Relationships Workshop",
    location: "Family Services Building",
    facilitator: "David Martinez, LCSW",
    attendees: 0,
    capacity: 18,
    status: "Scheduled",
    homeVisit: true,
    serviceCoordination: false
  },

  // ============================================
  // LAST WEEK (February 2-7, 2026)
  // ============================================
  {
    id: 1,
    date: "2026-02-03",
    time: "9:00 AM",
    topic: "New Family Orientation & Program Overview",
    location: "Main Conference Room",
    facilitator: "Maria Rodriguez, Program Director",
    attendees: 0,
    capacity: 20,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 2,
    date: "2026-02-04",
    time: "10:30 AM",
    topic: "Understanding Trauma-Informed Care",
    location: "Clinical Services Wing",
    facilitator: "Dr. James Wilson, Clinical Director",
    attendees: 0,
    capacity: 15,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: false
  },
  {
    id: 3,
    date: "2026-02-05",
    time: "2:00 PM",
    topic: "Mental Health & Clinical Services Overview",
    location: "Main Conference Room",
    facilitator: "Dr. Patricia Lee, Chief Psychiatrist",
    attendees: 0,
    capacity: 20,
    status: "Scheduled",
    homeVisit: true,
    serviceCoordination: true
  },
  {
    id: 4,
    date: "2026-02-06",
    time: "11:00 AM",
    topic: "Educational & Vocational Services",
    location: "Education Center",
    facilitator: "Michael Brown, Education Coordinator",
    attendees: 0,
    capacity: 15,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 5,
    date: "2026-02-07",
    time: "1:30 PM",
    topic: "Family Therapy & Visitation Guidelines",
    location: "Family Services Building",
    facilitator: "David Martinez, LCSW",
    attendees: 0,
    capacity: 12,
    status: "Scheduled",
    homeVisit: true,
    serviceCoordination: false
  },

  // ============================================
  // LAST WEEK (January 27 - February 1, 2026)
  // ============================================
  {
    id: 6,
    date: "2026-01-27",
    time: "10:00 AM",
    topic: "Residential Program & Daily Living Structure",
    location: "Residential Hall A",
    facilitator: "Sarah Chen, Residential Manager",
    attendees: 18,
    capacity: 25,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 7,
    date: "2026-01-28",
    time: "3:00 PM",
    topic: "Youth Success Stories & Alumni Panel",
    location: "Community Room",
    facilitator: "Robert Anderson, Alumni Coordinator",
    attendees: 35,
    capacity: 50,
    status: "Completed"
  },
  {
    id: 8,
    date: "2026-01-29",
    time: "9:30 AM",
    topic: "Substance Abuse Prevention & Education",
    location: "Education Center",
    facilitator: "Dr. Emily Thompson, Substance Abuse Counselor",
    attendees: 22,
    capacity: 30,
    status: "Completed"
  },
  {
    id: 9,
    date: "2026-01-30",
    time: "2:00 PM",
    topic: "Understanding the Intake & Assessment Process",
    location: "Main Conference Room",
    facilitator: "Maria Rodriguez, Program Director",
    attendees: 14,
    capacity: 20,
    status: "Completed"
  },
  {
    id: 10,
    date: "2026-01-31",
    time: "10:30 AM",
    topic: "Technology Safety & Digital Wellness",
    location: "Education Center",
    facilitator: "Dr. Kevin Park, Technology Coordinator",
    attendees: 17,
    capacity: 20,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },

  // ============================================
  // EARLIER IN JANUARY (January 20-26, 2026)
  // ============================================
  {
    id: 11,
    date: "2026-01-20",
    time: "9:00 AM",
    topic: "New Family Orientation & Program Overview",
    location: "Main Conference Room",
    facilitator: "Maria Rodriguez, Program Director",
    attendees: 15,
    capacity: 20,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 12,
    date: "2026-01-21",
    time: "10:30 AM",
    topic: "Understanding Trauma-Informed Care",
    location: "Clinical Services Wing",
    facilitator: "Dr. James Wilson, Clinical Director",
    attendees: 12,
    capacity: 15,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: false
  },
  {
    id: 13,
    date: "2026-01-22",
    time: "2:00 PM",
    topic: "Mental Health & Clinical Services Overview",
    location: "Main Conference Room",
    facilitator: "Dr. Patricia Lee, Chief Psychiatrist",
    attendees: 18,
    capacity: 20,
    status: "Completed",
    homeVisit: true,
    serviceCoordination: true
  },
  {
    id: 14,
    date: "2026-01-23",
    time: "11:00 AM",
    topic: "Educational & Vocational Services",
    location: "Education Center",
    facilitator: "Michael Brown, Education Coordinator",
    attendees: 0,
    capacity: 15,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 15,
    date: "2026-01-24",
    time: "1:30 PM",
    topic: "Family Therapy & Visitation Guidelines",
    location: "Family Services Building",
    facilitator: "David Martinez, LCSW",
    attendees: 0,
    capacity: 12,
    status: "Scheduled",
    homeVisit: true,
    serviceCoordination: false
  },
  {
    id: 16,
    date: "2026-01-25",
    time: "10:00 AM",
    topic: "Residential Program & Daily Living Structure",
    location: "Residential Hall A",
    facilitator: "Sarah Chen, Residential Manager",
    attendees: 0,
    capacity: 25,
    status: "Scheduled",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 17,
    date: "2026-01-26",
    time: "3:00 PM",
    topic: "Youth Success Stories & Alumni Panel",
    location: "Community Room",
    facilitator: "Robert Anderson, Alumni Coordinator",
    attendees: 0,
    capacity: 50,
    status: "Scheduled"
  },

  // ============================================
  // DECEMBER 2025
  // ============================================
  {
    id: 18,
    date: "2025-12-02",
    time: "10:00 AM",
    topic: "Holiday Program & Family Visits",
    location: "Main Conference Room",
    facilitator: "Sarah Chen, Residential Manager",
    attendees: 25,
    capacity: 30,
    status: "Completed"
  },
  {
    id: 19,
    date: "2025-12-05",
    time: "2:00 PM",
    topic: "Financial Assistance & Insurance Coverage",
    location: "Administration Building",
    facilitator: "James Wilson, Finance Director",
    attendees: 15,
    capacity: 15,
    status: "Completed"
  },
  {
    id: 20,
    date: "2025-12-09",
    time: "10:00 AM",
    topic: "Individual Treatment Planning Process",
    location: "Main Conference Room",
    facilitator: "Dr. Patricia Lee, Chief Psychiatrist",
    attendees: 20,
    capacity: 20,
    status: "Completed",
    homeVisit: true,
    serviceCoordination: true
  },
  {
    id: 21,
    date: "2025-12-12",
    time: "3:00 PM",
    topic: "Discharge Planning & Aftercare Services",
    location: "Clinical Services Wing",
    facilitator: "Michael Brown, Aftercare Coordinator",
    attendees: 13,
    capacity: 15,
    status: "Completed"
  },
  {
    id: 22,
    date: "2025-12-16",
    time: "11:00 AM",
    topic: "Therapeutic Recreation & Life Skills",
    location: "Recreation Center",
    facilitator: "Lisa Martinez, Recreation Therapist",
    attendees: 13,
    capacity: 20,
    status: "Completed"
  },
  {
    id: 23,
    date: "2025-12-19",
    time: "9:00 AM",
    topic: "Behavior Management & Positive Discipline",
    location: "Training Room B",
    facilitator: "Coach Williams, Behavior Specialist",
    attendees: 19,
    capacity: 25,
    status: "Completed"
  },
  {
    id: 24,
    date: "2025-12-23",
    time: "10:00 AM",
    topic: "Winter Break Programming Overview",
    location: "Main Conference Room",
    facilitator: "Maria Rodriguez, Program Director",
    attendees: 14,
    capacity: 20,
    status: "Completed"
  },
  {
    id: 25,
    date: "2025-12-27",
    time: "1:00 PM",
    topic: "New Year Goal Setting for Youth",
    location: "Recreation Center",
    facilitator: "Jennifer Garcia, Youth Counselor",
    attendees: 10,
    capacity: 15,
    status: "Completed"
  },

  // ============================================
  // NOVEMBER 2025
  // ============================================
  {
    id: 26,
    date: "2025-11-04",
    time: "9:00 AM",
    topic: "Cultural Competency & Diversity in Care",
    location: "Main Conference Room",
    facilitator: "Carmen Ruiz, Diversity Coordinator",
    attendees: 9,
    capacity: 15,
    status: "Completed"
  },
  {
    id: 27,
    date: "2025-11-11",
    time: "2:00 PM",
    topic: "Community Integration & Service Learning",
    location: "Community Outreach Center",
    facilitator: "Marcus Johnson, Community Liaison",
    attendees: 12,
    capacity: 20,
    status: "Completed"
  },
  {
    id: 28,
    date: "2025-11-18",
    time: "10:30 AM",
    topic: "Admissions Process & Requirements",
    location: "Main Conference Room",
    facilitator: "Maria Rodriguez, Program Director",
    attendees: 16,
    capacity: 20,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 29,
    date: "2025-11-25",
    time: "1:00 PM",
    topic: "Thanksgiving Week Family Activities",
    location: "Recreation Center",
    facilitator: "Lisa Martinez, Recreation Therapist",
    attendees: 0,
    capacity: 30,
    status: "Cancelled"
  },

  // ============================================
  // OCTOBER 2025
  // ============================================
  {
    id: 30,
    date: "2025-10-07",
    time: "10:00 AM",
    topic: "Mental Health Awareness Month Kickoff",
    location: "Main Conference Room",
    facilitator: "Dr. James Wilson, Clinical Director",
    attendees: 28,
    capacity: 30,
    status: "Completed"
  },
  {
    id: 31,
    date: "2025-10-14",
    time: "2:30 PM",
    topic: "Peer Support & Group Therapy Introduction",
    location: "Clinical Services Wing",
    facilitator: "David Martinez, LCSW",
    attendees: 14,
    capacity: 15,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 32,
    date: "2025-10-21",
    time: "9:00 AM",
    topic: "Academic Success & Study Skills Workshop",
    location: "Education Center",
    facilitator: "Michael Brown, Education Coordinator",
    attendees: 20,
    capacity: 25,
    status: "Completed"
  },
  {
    id: 33,
    date: "2025-10-28",
    time: "11:00 AM",
    topic: "Halloween Safety & Celebrations",
    location: "Recreation Center",
    facilitator: "Jennifer Garcia, Youth Counselor",
    attendees: 35,
    capacity: 40,
    status: "Completed"
  },

  // ============================================
  // SEPTEMBER 2025
  // ============================================
  {
    id: 34,
    date: "2025-09-08",
    time: "10:00 AM",
    topic: "Back-to-School Transitions & Support",
    location: "Education Center",
    facilitator: "Michael Brown, Education Coordinator",
    attendees: 22,
    capacity: 25,
    status: "Completed"
  },
  {
    id: 35,
    date: "2025-09-15",
    time: "1:30 PM",
    topic: "Nutrition & Healthy Living Workshop",
    location: "Medical Clinic",
    facilitator: "Dr. Emily Thompson, Medical Director",
    attendees: 18,
    capacity: 20,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 36,
    date: "2025-09-22",
    time: "9:30 AM",
    topic: "Conflict Resolution & Communication Skills",
    location: "Training Room B",
    facilitator: "Coach Williams, Behavior Specialist",
    attendees: 16,
    capacity: 20,
    status: "Completed"
  },
  {
    id: 37,
    date: "2025-09-29",
    time: "2:00 PM",
    topic: "Mindfulness & Stress Management Techniques",
    location: "Clinical Services Wing",
    facilitator: "Dr. Patricia Lee, Chief Psychiatrist",
    attendees: 19,
    capacity: 20,
    status: "Completed"
  },

  // ============================================
  // AUGUST 2025
  // ============================================
  {
    id: 38,
    date: "2025-08-05",
    time: "10:00 AM",
    topic: "Summer Program Wrap-Up & Achievements",
    location: "Main Conference Room",
    facilitator: "Maria Rodriguez, Program Director",
    attendees: 30,
    capacity: 35,
    status: "Completed"
  },
  {
    id: 39,
    date: "2025-08-12",
    time: "11:00 AM",
    topic: "Life Skills: Financial Literacy Basics",
    location: "Education Center",
    facilitator: "James Wilson, Finance Director",
    attendees: 15,
    capacity: 20,
    status: "Completed"
  },
  {
    id: 40,
    date: "2025-08-19",
    time: "2:00 PM",
    topic: "College & Career Readiness Planning",
    location: "Education Center",
    facilitator: "Michael Brown, Education Coordinator",
    attendees: 12,
    capacity: 15,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 41,
    date: "2025-08-26",
    time: "9:00 AM",
    topic: "Pre-School Year Family Consultation",
    location: "Family Services Building",
    facilitator: "Sarah Chen, Residential Manager",
    attendees: 20,
    capacity: 25,
    status: "Completed",
    homeVisit: true,
    serviceCoordination: true
  },

  // ============================================
  // JULY 2025
  // ============================================
  {
    id: 42,
    date: "2025-07-08",
    time: "10:30 AM",
    topic: "Summer Enrichment Activities Overview",
    location: "Recreation Center",
    facilitator: "Lisa Martinez, Recreation Therapist",
    attendees: 25,
    capacity: 30,
    status: "Completed"
  },
  {
    id: 43,
    date: "2025-07-15",
    time: "1:00 PM",
    topic: "Anger Management & Emotional Regulation",
    location: "Clinical Services Wing",
    facilitator: "Dr. Kevin Park, Crisis Specialist",
    attendees: 11,
    capacity: 15,
    status: "Completed"
  },
  {
    id: 44,
    date: "2025-07-22",
    time: "9:00 AM",
    topic: "Independence Day Celebration Follow-up",
    location: "Community Room",
    facilitator: "Marcus Johnson, Community Liaison",
    attendees: 28,
    capacity: 35,
    status: "Completed"
  },
  {
    id: 45,
    date: "2025-07-29",
    time: "2:30 PM",
    topic: "Social Media Safety & Digital Citizenship",
    location: "Education Center",
    facilitator: "Dr. Kevin Park, Technology Coordinator",
    attendees: 17,
    capacity: 20,
    status: "Completed"
  },

  // ============================================
  // JUNE 2025
  // ============================================
  {
    id: 46,
    date: "2025-06-03",
    time: "10:00 AM",
    topic: "Summer Transition Planning Session",
    location: "Main Conference Room",
    facilitator: "Maria Rodriguez, Program Director",
    attendees: 24,
    capacity: 30,
    status: "Completed"
  },
  {
    id: 47,
    date: "2025-06-10",
    time: "1:30 PM",
    topic: "LGBTQ+ Support & Inclusion Workshop",
    location: "Clinical Services Wing",
    facilitator: "Carmen Ruiz, Diversity Coordinator",
    attendees: 13,
    capacity: 15,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 48,
    date: "2025-06-17",
    time: "9:30 AM",
    topic: "Father's Day Family Engagement Event",
    location: "Family Services Building",
    facilitator: "David Martinez, LCSW",
    attendees: 18,
    capacity: 25,
    status: "Completed",
    homeVisit: true,
    serviceCoordination: false
  },
  {
    id: 49,
    date: "2025-06-24",
    time: "11:00 AM",
    topic: "End-of-School-Year Academic Review",
    location: "Education Center",
    facilitator: "Michael Brown, Education Coordinator",
    attendees: 16,
    capacity: 20,
    status: "Completed"
  },

  // ============================================
  // MAY 2025
  // ============================================
  {
    id: 50,
    date: "2025-05-06",
    time: "10:00 AM",
    topic: "Mental Health Awareness: Anxiety & Depression",
    location: "Clinical Services Wing",
    facilitator: "Dr. Patricia Lee, Chief Psychiatrist",
    attendees: 21,
    capacity: 25,
    status: "Completed"
  },
  {
    id: 51,
    date: "2025-05-13",
    time: "2:00 PM",
    topic: "Mother's Day Celebration & Family Workshop",
    location: "Family Services Building",
    facilitator: "Jennifer Garcia, Family Support Specialist",
    attendees: 27,
    capacity: 30,
    status: "Completed",
    homeVisit: true,
    serviceCoordination: true
  },
  {
    id: 52,
    date: "2025-05-20",
    time: "9:00 AM",
    topic: "Graduation Planning & Preparation",
    location: "Education Center",
    facilitator: "Michael Brown, Education Coordinator",
    attendees: 10,
    capacity: 15,
    status: "Completed"
  },
  {
    id: 53,
    date: "2025-05-27",
    time: "11:30 AM",
    topic: "Memorial Day Weekend Safety & Activities",
    location: "Recreation Center",
    facilitator: "Lisa Martinez, Recreation Therapist",
    attendees: 19,
    capacity: 25,
    status: "Completed"
  },

  // ============================================
  // APRIL 2025
  // ============================================
  {
    id: 54,
    date: "2025-04-08",
    time: "10:00 AM",
    topic: "Spring Wellness & Outdoor Activities",
    location: "Recreation Center",
    facilitator: "Lisa Martinez, Recreation Therapist",
    attendees: 22,
    capacity: 25,
    status: "Completed"
  },
  {
    id: 55,
    date: "2025-04-15",
    time: "1:00 PM",
    topic: "Substance Use Prevention: Teen Edition",
    location: "Education Center",
    facilitator: "Dr. Emily Thompson, Substance Abuse Counselor",
    attendees: 18,
    capacity: 20,
    status: "Completed"
  },
  {
    id: 56,
    date: "2025-04-22",
    time: "9:30 AM",
    topic: "Earth Day: Environmental Awareness",
    location: "Community Outreach Center",
    facilitator: "Marcus Johnson, Community Liaison",
    attendees: 14,
    capacity: 20,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 57,
    date: "2025-04-29",
    time: "2:30 PM",
    topic: "Test-Taking Strategies & Study Skills",
    location: "Education Center",
    facilitator: "Michael Brown, Education Coordinator",
    attendees: 15,
    capacity: 18,
    status: "Completed"
  },

  // ============================================
  // MARCH 2025
  // ============================================
  {
    id: 58,
    date: "2025-03-04",
    time: "10:00 AM",
    topic: "Women's History Month Celebration",
    location: "Main Conference Room",
    facilitator: "Carmen Ruiz, Diversity Coordinator",
    attendees: 20,
    capacity: 25,
    status: "Completed"
  },
  {
    id: 59,
    date: "2025-03-11",
    time: "11:00 AM",
    topic: "Self-Esteem & Body Image Workshop",
    location: "Clinical Services Wing",
    facilitator: "Dr. James Wilson, Clinical Director",
    attendees: 16,
    capacity: 20,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 60,
    date: "2025-03-18",
    time: "1:30 PM",
    topic: "Spring Break Safety Planning",
    location: "Main Conference Room",
    facilitator: "Dr. Kevin Park, Crisis Specialist",
    attendees: 12,
    capacity: 15,
    status: "Completed"
  },
  {
    id: 61,
    date: "2025-03-25",
    time: "9:00 AM",
    topic: "Family Communication & Healthy Boundaries",
    location: "Family Services Building",
    facilitator: "David Martinez, LCSW",
    attendees: 14,
    capacity: 18,
    status: "Completed",
    homeVisit: true,
    serviceCoordination: false
  },

  // ============================================
  // FEBRUARY 2025
  // ============================================
  {
    id: 62,
    date: "2025-02-04",
    time: "10:00 AM",
    topic: "Black History Month Celebration",
    location: "Main Conference Room",
    facilitator: "Carmen Ruiz, Diversity Coordinator",
    attendees: 26,
    capacity: 30,
    status: "Completed"
  },
  {
    id: 63,
    date: "2025-02-11",
    time: "2:00 PM",
    topic: "Valentine's Day: Healthy Relationships",
    location: "Clinical Services Wing",
    facilitator: "Jennifer Garcia, Family Support Specialist",
    attendees: 19,
    capacity: 20,
    status: "Completed"
  },
  {
    id: 64,
    date: "2025-02-18",
    time: "9:30 AM",
    topic: "Winter Blues: Seasonal Affective Disorder",
    location: "Medical Clinic",
    facilitator: "Dr. Patricia Lee, Chief Psychiatrist",
    attendees: 11,
    capacity: 15,
    status: "Completed",
    homeVisit: false,
    serviceCoordination: true
  },
  {
    id: 65,
    date: "2025-02-25",
    time: "11:00 AM",
    topic: "Career Exploration & Job Shadowing Program",
    location: "Education Center",
    facilitator: "Michael Brown, Education Coordinator",
    attendees: 13,
    capacity: 15,
    status: "Completed"
  }
];