import React, { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog"
import {
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Target,
  Award,
  TrendingUp,
  Calendar,
  Star,
  CheckCircle2,
  MessageSquare,
  Pencil,
  Trash2,
  X,
  Edit2,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { CopingSkillModal } from "./CopingSkillModal"
import { TriggerModal } from "./TriggerModal"
import { StrengthModal } from "./StrengthModal"
import {
  AcademicServicePlanDetails,
  AcademicServicePlanServicesTab,
} from "./AcademicServicePlanDetails"
import { TreatmentPlanningGoalsSection } from "./TreatmentPlanningGoalsSection"
import { TreatmentPlanningSupplementalSection } from "./TreatmentPlanningSupplementalSection"
import { TreatmentPlanningTraumaSection } from "./TreatmentPlanningTraumaSection"
import {
  STUDY_TIME_PLAN,
  STUDY_TIME_PLAN_DEFAULTS,
  isStudyTimePlanValid,
  studyTimePlanRecordFields,
  type TestingRecord,
} from "./StudyTimePlanDetails"
import { DateInput } from "../ui/date-input"
import { isoToMdy, mdyToIso, formatMdy } from "../../lib/dateFormat"
import type { YouthRef } from "../../lib/youthIdentity"
import { TransitionSummaryWorkspace } from "./TransitionSummaryWorkspace"
import { toast } from "sonner@2.0.3"
import {
  createPtp,
  deletePtp,
  isPtpStorageUnreadable,
  newPtpId,
  updatePtp,
  useYouthPtps,
} from "../../data/ptpStore"
import { getDemoUserName } from "../../lib/demoIdentity"

type TreatmentPlanningSubSection = "ptp" | "goals" | "strengths" | "copingSkills" | "triggers" | "supplementalPlans" | "traumaHistory" | "transitionSummary"

interface TreatmentPlanningViewProps {
  initialSubSection?: TreatmentPlanningSubSection
  /** Optional, additive: show only the Supplemental Plans content (no
   *  Treatment Planning header or sub-tab strip). Used by Community Care. */
  supplementalOnly?: boolean
  /** Optional, additive: Member column in the Plans table (Community Care directory). */
  showMemberColumn?: boolean
  /** Optional: Member dropdown options in the Add/Edit Plan dialog. */
  memberOptions?: string[]
  hiddenTabs?: TreatmentPlanningSubSection[]
  /** Youth's testing/assessment records — used by the Study Time Plan's Test Scores. */
  testingAssessments?: TestingRecord[]
  /** Constituent Youth profiles only (US 20101 / 20103): the verified
   *  Youth Constituent that owns Transition Summaries. undefined hides the
   *  Transition Summary tab; null shows it as unavailable. */
  transitionSummaryYouth?: YouthRef | null
  /** Constituent Youth profiles only: the verified owner of the PTP
   *  records shown and edited here. undefined keeps the existing
   *  local-only PTP list (e.g. Admissions); null = owner can't be
   *  verified, so no PTPs are shown or saved. */
  constituentYouth?: YouthRef | null
  /** Opens Transition Summary on this External summary (deep link). */
  initialTransitionSummaryId?: string
}

export function TreatmentPlanningView({
  initialSubSection = "ptp",
  supplementalOnly = false,
  showMemberColumn = false,
  memberOptions,
  hiddenTabs = [],
  testingAssessments = [],
  transitionSummaryYouth,
  constituentYouth,
  initialTransitionSummaryId,
}: TreatmentPlanningViewProps) {
  const [activeSubSection, setActiveSubSection] =
    useState<TreatmentPlanningSubSection>(
      initialTransitionSummaryId && transitionSummaryYouth !== undefined
        ? "transitionSummary"
        : initialSubSection,
    )

  // PTP state - Positive Transition Plan
  const [treatmentModalities, setTreatmentModalities] = useState([
    {
      id: 1,
      statement:
        "Youth will maintain stable housing and employment post-discharge",
      outcomeDomains: ["Daily Living Skills", "Work and Study Life"],
      otherOutcomeDomain: "",
      startDate: "12/01/2024",
      endDate: "06/01/2025",
      goalsCompleted: "3/5",
      status: "In Progress",
      comments: [
        {
          id: 1,
          date: "12/05/2024",
          comment:
            "Initial assessment completed. Youth shows strong motivation.",
        },
        {
          id: 2,
          date: "12/20/2024",
          comment: "Progress review: Housing application submitted.",
        },
      ],
    },
    {
      id: 2,
      statement:
        "Youth will establish healthy relationships with family and peers",
      outcomeDomains: ["Relationships and Communication"],
      otherOutcomeDomain: "",
      startDate: "12/01/2024",
      endDate: "06/01/2025",
      goalsCompleted: "2/4",
      status: "In Progress",
      comments: [],
    },
    {
      id: 3,
      statement:
        "Youth will demonstrate emotional regulation and mental health stability",
      outcomeDomains: ["Self-Care Skills", "Looking Forward"],
      otherOutcomeDomain: "",
      startDate: "12/15/2024",
      endDate: "05/15/2025",
      goalsCompleted: "4/6",
      status: "In Progress",
      comments: [
        {
          id: 1,
          date: "12/18/2024",
          comment: "Started weekly therapy sessions.",
        },
      ],
    },
    {
      id: 4,
      statement:
        "Youth will complete high school education and pursue vocational training",
      outcomeDomains: ["Education & Vocation", "Career and Education Planning"],
      otherOutcomeDomain: "",
      startDate: "12/01/2024",
      endDate: "06/01/2025",
      goalsCompleted: "5/5",
      status: "Completed",
      comments: [],
    },
  ])
  // Constituent Youth profiles read/write the youth-owned PTP store; the
  // generic list above stays local-only for other callers (Admissions).
  const ptpStoreMode = constituentYouth !== undefined
  const ownedPtps = useYouthPtps(constituentYouth?.id ?? "")
  const ptpRows: {
    id: string | number
    statement: string
    outcomeDomains: string[]
    otherOutcomeDomain: string
    startDate: string
    endDate: string
    goalsCompleted: string
    status: string
    comments: { id: number; date: string; comment: string }[]
  }[] = ptpStoreMode ? ownedPtps : treatmentModalities
  const ptpUnavailableReason = !ptpStoreMode
    ? ""
    : !constituentYouth
      ? "PTPs are unavailable because this profile could not be confirmed as a Youth constituent."
      : isPtpStorageUnreadable()
        ? "Saved PTPs can't be read right now, so they aren't shown and can't be changed."
        : ""
  const [showAddPTPModal, setShowAddPTPModal] = useState(false)
  const [showEditPTPModal, setShowEditPTPModal] = useState(false)
  const [showAddModality, setShowAddModality] = useState(false)
  const [showEditModality, setShowEditModality] = useState(false)
  const [newModality, setNewModality] = useState({
    statement: "",
    outcomeDomains: [] as string[],
    otherOutcomeDomain: "",
    startDate: "",
    endDate: "",
    goalsCompleted: "",
    status: "New",
    comments: [] as { id: number; date: string; comment: string }[],
  })
  const [editModality, setEditModality] = useState({
    statement: "",
    outcomeDomains: [] as string[],
    otherOutcomeDomain: "",
    startDate: "",
    endDate: "",
    goalsCompleted: "",
    status: "New",
    comments: [] as { id: number; date: string; comment: string }[],
  })
  const [editingModalityId, setEditingModalityId] =
    useState<string | number | null>(null)
  const [newComment, setNewComment] = useState({ date: "", comment: "" })
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)

  const startDate = ""
  const targetEnd = null

  // Goals state - Mercy Home Youth Treatment Planning Data
  const [goals, setGoals] = useState([
    {
      id: 1,
      goal: "Enhance Emotional Regulation and Mental Health Stability",
      targetDate: "2026-07-15",
      progress: 38,
      status: "In Progress",
      category: "Clinical/Behavioral",
      parentId: null,
      description:
        "This goal aims to support Jasmine in developing comprehensive emotional regulation skills and achieving mental health stability through evidence-based therapeutic interventions. The focus includes identifying emotional triggers, implementing DBT skills for distress tolerance, practicing mindfulness techniques, and building a robust toolkit of healthy coping mechanisms. Jasmine will participate in individual therapy twice weekly, attend DBT skills group sessions, and engage in daily emotional check-ins with residential staff. Progress will be tracked through reduced crisis incidents, improved mood stability scores, and demonstrated use of learned coping skills in challenging situations.",
      relatedPTPStatement: "Mental Health Services",
      enrollee: "Jasmine Rivera",
      pointPersonName: "Dr. Emily Torres, PsyD",
      outcomeDomain: "Mental Health & Emotional Wellness",
      reasonForGoal:
        "Jasmine has a history of depression, anxiety, and self-harm behaviors related to childhood trauma and attachment disruption. Recent psychiatric evaluation indicated need for intensive therapeutic support to address emotional dysregulation and develop healthier coping patterns. This goal is foundational to her overall treatment success and long-term well-being.",
      startDate: "2025-01-20",
      targetEndDate: "2026-07-15",
      youthNotes:
        "I'm tired of feeling out of control with my emotions. Sometimes everything feels overwhelming and I don't know how to handle it without hurting myself. I want to get better and learn healthier ways to cope when life gets hard.",
      comments: [
        {
          id: 1,
          author: "Dr. Emily Torres, PsyD",
          date: "Jan 13, 2026",
          time: "3:15 PM",
          text: "Jasmine successfully utilized the TIPP skill during a dysregulated moment today. She used cold water on her face and paced breathing to bring herself down from a 9/10 distress to a 4/10. This is excellent application of DBT skills in real-time crisis.",
        },
        {
          id: 2,
          author: "Nicole Parker, MSW",
          date: "Jan 9, 2026",
          time: "7:45 PM",
          text: "Evening check-in showed Jasmine maintained stable mood throughout a challenging day including difficult school assignment and peer conflict. She reported using three different coping skills proactively.",
        },
      ],
    },
    {
      id: 2,
      goal: "Practice DBT distress tolerance skills daily and maintain mood journal",
      targetDate: "2026-04-15",
      progress: 52,
      status: "In Progress",
      category: "Intermediate Goal",
      parentId: 1,
      description:
        "Utilize assigned DBT distress tolerance skills (TIPP, ACCEPTS, self-soothing) minimum once daily during emotional distress. Complete daily mood tracking journal documenting emotional states, triggers encountered, coping skills used, and effectiveness ratings. Review journal entries during weekly individual therapy sessions to identify patterns and refine coping strategies.",
      enrollee: "Jasmine Rivera",
      enrolleeCount: 1,
      startDate: "2025-01-20",
      targetEndDate: "2026-04-15",
      pointPersonName: "Dr. Emily Torres, PsyD",
      outcomeDomain: "Mental Health & Emotional Wellness",
      reasonForGoal:
        "Consistent practice of DBT skills is essential for skill internalization and generalization to real-world situations. Daily mood tracking provides concrete data for treatment planning and helps Jasmine develop self-awareness of her emotional patterns.",
      youthNotes:
        "Tracking my moods helps me see patterns I didn't notice before. I'm getting better at remembering to use my skills before things get really bad.",
    },
    {
      id: 11,
      goal: "Reduce self-harm urges and behaviors through crisis plan implementation",
      targetDate: "2026-05-30",
      progress: 35,
      status: "In Progress",
      category: "Intermediate Goal",
      parentId: 1,
      description:
        "Follow personalized crisis safety plan when experiencing urges to self-harm. Plan includes immediate use of sensory grounding techniques, contacting designated support person, utilizing on-campus crisis resources, and documenting the incident. Goal is to reduce self-harm incidents by 75% from baseline and demonstrate consistent use of alternative coping strategies during high-risk moments.",
      enrollee: "Jasmine Rivera",
      enrolleeCount: 1,
      startDate: "2025-01-20",
      targetEndDate: "2026-05-30",
      pointPersonName: "Dr. Emily Torres, PsyD",
      outcomeDomain: "Mental Health & Emotional Wellness",
      reasonForGoal:
        "Self-harm behaviors put Jasmine at risk and indicate need for stronger crisis management skills. Learning to implement safety plan consistently demonstrates emotional regulation progress and builds healthier coping patterns.",
      youthNotes:
        "It's hard when I get the urge to hurt myself, but I'm trying to use my crisis plan instead. Sometimes it actually works and I feel proud I didn't give in.",
    },
    {
      id: 3,
      goal: "Rebuild and Strengthen Family Connections",
      targetDate: "2026-08-30",
      progress: 22,
      status: "In Progress",
      category: "Family Engagement",
      parentId: null,
      description:
        "This comprehensive family-focused goal seeks to repair and enhance the relationship between Jasmine and her biological mother through structured family therapy, gradual reintegration activities, and development of healthy communication patterns. The work includes addressing historical trauma, establishing appropriate boundaries, processing past hurts, rebuilding trust, and creating sustainable patterns for positive interaction. Family therapy sessions occur biweekly with opportunities for supervised visits, phone contact, and eventually unsupervised home passes as progress is demonstrated. Success indicators include reduced conflict during interactions, increased positive communication, and mutually agreed-upon reunification timeline.",
      relatedPTPStatement: "Family Engagement",
      enrollee: "Jasmine Rivera",
      pointPersonName: "Carlos Martinez, LMFT",
      outcomeDomain: "Family Relationships & Permanency",
      reasonForGoal:
        "Jasmine entered care following family crisis and mother's struggle with substance use. While separated for safety reasons, both Jasmine and her mother have expressed desire for reunification. Mother has completed substance abuse treatment and maintains sobriety. Family therapy is critical to address relational issues, rebuild trust, and ensure safe reunification when clinically appropriate.",
      startDate: "2025-02-01",
      targetEndDate: "2026-08-30",
      youthNotes:
        "I miss my mom a lot but I'm also scared about getting hurt again. I want our relationship to be better this time. I hope she stays clean and we can really work on our problems together. Maybe one day I can go home.",
      comments: [
        {
          id: 1,
          author: "Carlos Martinez, LMFT",
          date: "Jan 11, 2026",
          time: "2:00 PM",
          text: "Today's family session focused on active listening skills. Both Jasmine and mom practiced reflecting each other's feelings. Mom shared her pride in Jasmine's progress and apologized for past hurt. Jasmine was able to express her feelings safely.",
        },
        {
          id: 2,
          author: "Anna Williams, Case Manager",
          date: "Jan 8, 2026",
          time: "10:30 AM",
          text: "Jasmine had a positive 30-minute phone call with her mother. Conversation remained appropriate and supportive throughout. Jasmine reported feeling happy after the call and looking forward to their next family therapy session.",
        },
      ],
    },
    {
      id: 4,
      goal: "Complete bi-weekly family therapy and practice communication skills",
      targetDate: "2026-06-30",
      progress: 38,
      status: "In Progress",
      category: "Intermediate Goal",
      parentId: 3,
      description:
        "Attend all scheduled bi-weekly family therapy sessions with mother and therapist. Actively participate by practicing active listening, using I-statements, expressing feelings appropriately, and receiving feedback without defensiveness. Demonstrate at least 3 new communication skills learned in therapy during supervised family visits. Complete assigned homework exercises between sessions.",
      enrollee: "Jasmine Rivera",
      enrolleeCount: 1,
      startDate: "2025-02-01",
      targetEndDate: "2026-06-30",
      pointPersonName: "Carlos Martinez, LMFT",
      outcomeDomain: "Family Relationships & Permanency",
      reasonForGoal:
        "Regular family therapy participation is essential for processing past trauma, building trust, and developing healthier interaction patterns between Jasmine and her mother. Skill practice during sessions prepares for eventual reunification.",
      youthNotes:
        "Family therapy is hard but I know it's important. I'm learning how to tell my mom how I feel without it turning into a fight.",
    },
    {
      id: 12,
      goal: "Participate in supervised family visits demonstrating positive engagement",
      targetDate: "2026-07-15",
      progress: 28,
      status: "In Progress",
      category: "Intermediate Goal",
      parentId: 3,
      description:
        "Attend monthly supervised family visits with mother, maintaining respectful communication, managing emotions appropriately, and engaging in planned activities together. Demonstrate improvement in conflict de-escalation and use of healthy coping skills if disagreements arise. Work toward graduating to unsupervised visits by demonstrating consistent positive interactions over 3 consecutive successful visits.",
      enrollee: "Jasmine Rivera",
      enrolleeCount: 1,
      startDate: "2025-02-01",
      targetEndDate: "2026-07-15",
      pointPersonName: "Carlos Martinez, LMFT",
      outcomeDomain: "Family Relationships & Permanency",
      reasonForGoal:
        "Supervised visits provide safe opportunities to practice new communication skills and rebuild positive relationship patterns with mother. Progressive success in visits demonstrates reunification readiness and builds confidence for both Jasmine and her mother.",
      youthNotes:
        "I look forward to seeing my mom during visits. We're learning how to just enjoy being together without bringing up all the hard stuff from before.",
    },
    {
      id: 5,
      goal: "Improve Academic Performance and School Engagement",
      targetDate: "2026-06-30",
      progress: 51,
      status: "In Progress",
      category: "Educational",
      parentId: null,
      description:
        "This educational goal centers on improving Jasmine's academic outcomes through increased school attendance, enhanced study skills, consistent completion of assignments, and active classroom participation. Interventions include twice-weekly tutoring sessions in math and English, implementation of organizational systems, development of test-taking strategies, and collaboration with school staff to address learning needs. The goal also emphasizes exploring Jasmine's academic interests and post-secondary options to increase motivation and long-term planning. Progress is measured through quarterly report cards, weekly progress reports from teachers, assignment completion rates, and standardized assessment scores.",
      relatedPTPStatement: "Educational Support",
      enrollee: "Jasmine Rivera",
      pointPersonName: "Michael Chen, Education Advocate",
      outcomeDomain: "Education & Academic Achievement",
      reasonForGoal:
        "Jasmine's academic performance suffered significantly during the period of family instability prior to placement. She is currently behind in credits needed for on-time graduation and has expressed feelings of academic inadequacy. Assessment shows Jasmine has solid cognitive abilities but lacks consistent study habits and organizational skills. Academic success is crucial for her self-esteem and future opportunities.",
      startDate: "2025-01-20",
      targetEndDate: "2026-06-30",
      youthNotes:
        "School has always been hard for me, especially since everything that happened at home. I want to do better and graduate with my class. I like art and creative writing, so maybe I can focus on those things for my future. The tutoring is helping me catch up.",
      comments: [
        {
          id: 1,
          author: "Michael Chen, Education Advocate",
          date: "Jan 12, 2026",
          time: "4:00 PM",
          text: "Jasmine's English teacher reported she submitted a beautifully written personal narrative essay. The teacher was impressed by her voice and emotional depth. Jasmine is building confidence in her writing abilities.",
        },
        {
          id: 2,
          author: "Sandra Lopez, Math Tutor",
          date: "Jan 10, 2026",
          time: "5:15 PM",
          text: "Great tutoring session today. Jasmine mastered solving two-step equations and scored 85% on the practice quiz. She's showing real progress in algebra and her confidence is growing.",
        },
        {
          id: 3,
          author: "Michael Chen, Education Advocate",
          date: "Jan 7, 2026",
          time: "9:00 AM",
          text: "Jasmine achieved 100% attendance for the second week in a row! This consistency is making a significant difference in her ability to keep up with coursework. Celebrated this achievement during our check-in.",
        },
      ],
    },
    {
      id: 6,
      goal: "Achieve 90% or higher school attendance for consecutive semester",
      targetDate: "2026-05-30",
      progress: 65,
      status: "In Progress",
      category: "Intermediate Goal",
      parentId: 5,
      description:
        "Maintain minimum 90% school attendance rate throughout spring semester. Utilize morning routine checklist to ensure timely departure. Communicate proactively with education advocate about any barriers to attendance (illness, transportation, emotional struggles). Develop contingency plans for challenging days to prevent absences. Track attendance weekly and celebrate milestones.",
      enrollee: "Jasmine Rivera",
      enrolleeCount: 1,
      startDate: "2025-01-20",
      targetEndDate: "2026-05-30",
      pointPersonName: "Michael Chen, Education Advocate",
      outcomeDomain: "Education & Academic Achievement",
      reasonForGoal:
        "Consistent school attendance is foundational to academic success and credit accumulation toward on-time graduation. Jasmine's previous attendance issues contributed to falling behind academically. Building this habit now is essential for catching up and meeting graduation requirements.",
      youthNotes:
        "I'm proud that I've been going to school almost every day. It helps that I have a better routine now and people who help me get there even when I don't feel like it.",
    },
    {
      id: 13,
      goal: "Complete all homework assignments and utilize organizational system",
      targetDate: "2026-06-15",
      progress: 50,
      status: "In Progress",
      category: "Intermediate Goal",
      parentId: 5,
      description:
        "Use planner to track all homework assignments and due dates. Complete and submit 95% of homework on time each month. Attend twice-weekly tutoring sessions for math and English support. Utilize organizational binder system with color-coded folders for each subject. Request help from teachers or tutors when struggling rather than avoiding assignments.",
      enrollee: "Jasmine Rivera",
      enrolleeCount: 1,
      startDate: "2025-01-20",
      targetEndDate: "2026-06-15",
      pointPersonName: "Michael Chen, Education Advocate",
      outcomeDomain: "Education & Academic Achievement",
      reasonForGoal:
        "Homework completion directly impacts grades and demonstrates mastery of course content. Organizational skills deficits have historically led to missed assignments and lowered GPA. Systematic approach with support structures will build sustainable academic habits.",
      youthNotes:
        "My planner really helps me remember what I need to do. I don't lose assignments as much now that everything has its own folder. Tutoring helps a lot with the stuff I don't get.",
    },
    {
      id: 7,
      goal: "Develop Independent Living Skills for Transition Success",
      targetDate: "2026-09-15",
      progress: 19,
      status: "In Progress",
      category: "Life Skills/Transition",
      parentId: null,
      description:
        "This transitional goal prepares Jasmine for independent living by systematically building practical life skills across essential domains including financial management, household operations, personal health and wellness, employment readiness, transportation navigation, and community resource utilization. Through hands-on workshops, simulated living experiences, and progressive responsibility assignments, Jasmine will gain the competence and confidence needed for successful independent living. Curriculum components include budgeting and banking, nutritional cooking, apartment care, job search strategies, interview skills, public transportation use, and connecting with support services. Competency will be demonstrated through completion of independent living skills assessments and successful participation in transitional living apartment program.",
      relatedPTPStatement: "Life Skills Development",
      enrollee: "Jasmine Rivera",
      pointPersonName: "Tanya Brooks, ILS Specialist",
      outcomeDomain: "Life Skills & Self-Sufficiency",
      reasonForGoal:
        "At age 17, Jasmine is nearing emancipation age and will require comprehensive independent living skills for successful transition to adulthood. Assessment indicates significant skill gaps in areas of financial literacy, meal preparation, household management, and employment readiness. Building these competencies is essential for preventing homelessness and ensuring sustainable independence post-discharge.",
      startDate: "2025-02-15",
      targetEndDate: "2026-09-15",
      youthNotes:
        "I'm nervous about being on my own, but I know I need to learn how to take care of myself. I don't know much about paying bills or managing money. I want to learn how to cook healthy food and find a good job. These classes will help me be ready for my own place.",
      comments: [
        {
          id: 1,
          author: "Tanya Brooks, ILS Specialist",
          date: "Jan 13, 2026",
          time: "6:30 PM",
          text: "Jasmine successfully prepared spaghetti with homemade marinara sauce and a side salad for tonight's dinner. She shopped for ingredients within budget, followed the recipe independently, and practiced proper food safety. Excellent progress in culinary skills!",
        },
        {
          id: 2,
          author: "Robert Johnson, Vocational Counselor",
          date: "Jan 9, 2026",
          time: "2:45 PM",
          text: "Jasmine completed her resume and practiced mock interview questions. She presented herself professionally and demonstrated good communication skills. We discussed potential job opportunities at local retail stores and cafes.",
        },
      ],
    },
    {
      id: 8,
      goal: "Complete financial literacy course and establish banking account",
      targetDate: "2026-06-15",
      progress: 32,
      status: "In Progress",
      category: "Intermediate Goal",
      parentId: 7,
      description:
        "Successfully complete 8-week financial literacy workshop covering budgeting, saving, banking basics, credit understanding, and avoiding financial scams. Open youth savings account at local credit union with ILS specialist support. Make minimum monthly deposits of $20 from allowance or earnings. Learn to balance account using mobile app and monthly statements. Demonstrate understanding by creating and maintaining personal budget for 3 months.",
      enrollee: "Jasmine Rivera",
      enrolleeCount: 1,
      startDate: "2025-02-15",
      targetEndDate: "2026-06-15",
      pointPersonName: "Tanya Brooks, ILS Specialist",
      outcomeDomain: "Life Skills & Self-Sufficiency",
      reasonForGoal:
        "Financial literacy is critical for independent living success and avoiding common pitfalls like predatory lending and overspending. Opening savings account builds banking relationship and establishes healthy savings habit early. These skills are essential for managing limited resources post-discharge.",
      youthNotes:
        "I never really understood money before. The class taught me how to budget and why saving is important. I'm excited to have my own bank account and watch my savings grow.",
    },
    {
      id: 14,
      goal: "Demonstrate proficiency in meal planning and preparation skills",
      targetDate: "2026-07-30",
      progress: 28,
      status: "In Progress",
      category: "Intermediate Goal",
      parentId: 7,
      description:
        "Plan and prepare nutritious meals independently twice weekly using provided budget and ingredients. Learn 15 healthy, budget-friendly recipes. Demonstrate proper food safety practices including storage, temperature control, and kitchen sanitation. Create weekly meal plans that balance nutrition with cost constraints. Shop for groceries using list and staying within $50 weekly budget. Clean up kitchen thoroughly after cooking.",
      enrollee: "Jasmine Rivera",
      enrolleeCount: 1,
      startDate: "2025-02-15",
      targetEndDate: "2026-07-30",
      pointPersonName: "Tanya Brooks, ILS Specialist",
      outcomeDomain: "Life Skills & Self-Sufficiency",
      reasonForGoal:
        "Cooking skills are essential for healthy eating, budget management, and self-sufficiency in independent living. Learning to meal plan prevents food waste and ensures nutritious diet on limited budget. These are survival skills Jasmine will need immediately upon discharge.",
      youthNotes:
        "I actually like cooking now! It's fun to try new recipes and I feel proud when people like what I made. It's also nice to know I won't have to eat fast food all the time when I'm on my own.",
    },
    {
      id: 9,
      goal: "Build Positive Peer Relationships and Social Skills",
      targetDate: "2026-07-30",
      progress: 42,
      status: "In Progress",
      category: "Social/Interpersonal",
      parentId: null,
      description:
        "This social-emotional goal focuses on helping Jasmine develop healthy peer relationships and strengthen interpersonal communication skills through structured group activities, social skills training, and supported social interactions. The work addresses identifying healthy versus unhealthy relationships, setting appropriate boundaries, conflict resolution, assertive communication, and building positive social connections. Jasmine will participate in weekly social skills group, engage in supervised peer recreational activities, and practice relationship skills in residential community. Progress is evaluated through peer feedback, staff observations, reduction in peer conflicts, and Jasmine's self-reported social comfort and connection.",
      relatedPTPStatement: "Trauma-Informed Care",
      enrollee: "Jasmine Rivera",
      pointPersonName: "Jennifer Davis, LCSW",
      outcomeDomain: "Social Skills & Peer Relationships",
      reasonForGoal:
        "Jasmine has historically struggled with peer relationships, often gravitating toward negative influences and experiencing frequent conflicts. She reports difficulty trusting peers and making healthy friendships. Social skills development is critical for her emotional well-being, community integration, and long-term relationship success.",
      startDate: "2025-01-25",
      targetEndDate: "2026-07-30",
      youthNotes:
        "I've always had trouble making real friends. I usually end up in drama or hanging out with the wrong people. I want to learn how to have healthy friendships and not let people use me or treat me badly. It's hard for me to trust people.",
      comments: [
        {
          id: 1,
          author: "Jennifer Davis, LCSW",
          date: "Jan 12, 2026",
          time: "4:30 PM",
          text: "During social skills group, Jasmine demonstrated excellent active listening and gave supportive feedback to a peer sharing a difficult experience. She's showing growth in empathy and appropriate social responses.",
        },
        {
          id: 2,
          author: "Marcus Thompson, Youth Care Worker",
          date: "Jan 10, 2026",
          time: "8:00 PM",
          text: "Observed Jasmine using assertive communication to set a boundary with another youth who was being intrusive. She handled the situation calmly and appropriately without escalation. Great application of skills learned in therapy.",
        },
      ],
    },
    {
      id: 10,
      goal: "Attend weekly social skills group and demonstrate active participation",
      targetDate: "2026-06-30",
      progress: 55,
      status: "In Progress",
      category: "Intermediate Goal",
      parentId: 9,
      description:
        "Attend weekly social skills group sessions with 100% attendance. Actively participate by sharing experiences, completing in-session exercises, and providing supportive peer feedback. Practice targeted skills including active listening, assertive communication, conflict resolution, and reading social cues. Apply at least 2 learned skills per week in daily residential interactions and document experiences in skills practice log reviewed with therapist.",
      enrollee: "Jasmine Rivera",
      enrolleeCount: 1,
      startDate: "2025-01-25",
      targetEndDate: "2026-06-30",
      pointPersonName: "Jennifer Davis, LCSW",
      outcomeDomain: "Social Skills & Peer Relationships",
      reasonForGoal:
        "Structured social skills group provides safe environment to learn and practice interpersonal skills with peer modeling and professional facilitation. Regular attendance and active participation accelerates skill development and creates accountability for applying skills in real-world situations.",
      youthNotes:
        "Social skills group is actually helpful. I've learned how to speak up for myself without being mean and how to tell if someone is really my friend or just using me.",
    },
    {
      id: 15,
      goal: "Build and maintain at least 2 positive peer friendships",
      targetDate: "2026-07-15",
      progress: 42,
      status: "In Progress",
      category: "Intermediate Goal",
      parentId: 9,
      description:
        "Identify and develop friendships with 2 peers who demonstrate positive qualities and healthy relationship patterns. Engage in structured social activities together minimum twice weekly (recreational outings, study groups, shared hobbies). Practice healthy friendship skills including mutual respect, appropriate boundaries, honest communication, and conflict resolution. Discuss friendships regularly in individual therapy to process challenges and celebrate successes.",
      enrollee: "Jasmine Rivera",
      enrolleeCount: 1,
      startDate: "2025-01-25",
      targetEndDate: "2026-07-15",
      pointPersonName: "Jennifer Davis, LCSW",
      outcomeDomain: "Social Skills & Peer Relationships",
      reasonForGoal:
        "Positive peer relationships are essential for emotional well-being, social development, and long-term mental health. Building friendships with pro-social peers provides healthy support system and reduces risk of gravitating toward negative influences. Practical experience managing friendships builds confidence and relationship skills.",
      youthNotes:
        "I have two friends here who are really good to me. We support each other and don't get into drama. It feels different than my friendships before - like we actually care about each other and want good things for each other.",
    },
  ])
  const [showAddGoal, setShowAddGoal] = useState<number | null | "top">(null) // null = not showing, 'top' = adding top-level goal, number = adding child to that parent ID
  const [showAddGoalModal, setShowAddGoalModal] = useState(false)
  const [showEditGoalModal, setShowEditGoalModal] = useState(false)
  const [editGoalType, setEditGoalType] = useState<"major" | "intermediate">(
    "major",
  )
  const [expandedGoals, setExpandedGoals] = useState<number[]>([]) // All goals closed by default
  const [newGoal, setNewGoal] = useState({
    goal: "",
    goalText: "",
    relatedPTPStatement: "",
    reasonForGoal: "",
    pointPersonName: "",
    outcomeDomain: "",
    startDate: "",
    targetDuration: "",
    targetEndDate: "",
    endDate: "",
    goalPercentage: "",
    targetDate: "",
    category: "",
    parentId: null as number | null,
    progress: 0,
    description: "",
    enrollee: "",
    enrolleeCount: 0,
  })
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null)
  const [editGoalData, setEditGoalData] = useState({
    goal: "",
    goalText: "",
    relatedPTPStatement: "",
    reasonForGoal: "",
    pointPersonName: "",
    outcomeDomain: "",
    startDate: "",
    targetDuration: "",
    targetEndDate: "",
    endDate: "",
    targetDate: "",
    category: "",
    progress: 0,
    description: "",
    enrollee: "",
    youthNotes: "",
    parentId: null as number | null,
  })

  // Strengths state
  const [strengths, setStrengths] = useState([
    {
      id: 1,
      dateReported: "2024-12-01",
      lastITPInclusion: "2025-01-15",
      subject: "Emotional Wellness",
      strength: "Strong desire to improve",
      description:
        "Youth expresses genuine commitment to treatment and shows consistent motivation",
      reportedBy: "Dr. Emily Torres",
      createdBy: "Sarah Johnson",
      comments: [
        {
          id: 1,
          date: "2025-01-10",
          comment:
            "Youth demonstrated significant progress in emotional regulation during group session",
          createdBy: "Dr. Emily Torres",
          createdAt: "2025-01-10T14:30:00",
        },
        {
          id: 2,
          date: "2025-01-18",
          comment:
            "Continues to show exceptional motivation and commitment to treatment goals",
          createdBy: "Sarah Johnson",
          createdAt: "2025-01-18T10:15:00",
        },
      ],
    },
    {
      id: 2,
      dateReported: "2024-12-05",
      lastITPInclusion: "2025-01-15",
      subject: "Cognitive Skills",
      strength: "Creative problem-solving",
      description:
        "Demonstrates innovative thinking in group activities and individual sessions",
      reportedBy: "Michael Chen",
      createdBy: "Sarah Johnson",
      comments: [
        {
          id: 1,
          date: "2025-01-12",
          comment:
            "Youth proposed creative solution to peer conflict that was well-received by group",
          createdBy: "Michael Chen",
          createdAt: "2025-01-12T16:45:00",
        },
        {
          id: 2,
          date: "2025-01-20",
          comment:
            "Applied problem-solving skills independently during challenging academic assignment",
          createdBy: "Jennifer Davis",
          createdAt: "2025-01-20T09:30:00",
        },
        {
          id: 3,
          date: "2025-01-25",
          comment:
            "Helped another resident work through a difficult situation using creative approach",
          createdBy: "Sarah Johnson",
          createdAt: "2025-01-25T11:20:00",
        },
      ],
    },
    {
      id: 3,
      dateReported: "2024-12-10",
      lastITPInclusion: "2025-01-15",
      subject: "Family Engagement",
      strength: "Supportive family system",
      description:
        "Parents actively engaged in treatment process with regular attendance",
      reportedBy: "Dr. Emily Torres",
      createdBy: "Sarah Johnson",
      comments: [],
    },
  ])
  const [showAddStrengthModal, setShowAddStrengthModal] = useState(false)
  const [newStrength, setNewStrength] = useState({
    dateReported: "",
    lastITPInclusion: "",
    subject: "",
    strength: "",
    description: "",
    reportedBy: "",
    createdBy: "",
  })
  const [editingStrengthId, setEditingStrengthId] = useState<number | null>(
    null,
  )
  const [showEditStrengthModal, setShowEditStrengthModal] = useState(false)
  const [editStrengthData, setEditStrengthData] = useState({
    dateReported: "",
    lastITPInclusion: "",
    subject: "",
    strength: "",
    description: "",
    reportedBy: "",
    createdBy: "",
    comments: [],
  })
  const [newStrengthComment, setNewStrengthComment] = useState({
    date: "",
    comment: "",
  })

  // Coping Skills state
  const [copingSkills, setCopingSkills] = useState([
    {
      id: 1,
      dateReported: "2024-12-01",
      lastITPInclusion: "2025-01-15",
      copingSkill: "Deep breathing exercises",
      description:
        "Youth uses deep breathing techniques when feeling anxious or overwhelmed",
      effectiveWhen: "Experiencing anxiety or stress",
      reportedBy: "Dr. Emily Torres",
      createdBy: "Sarah Johnson",
      comments: [
        {
          id: 1,
          date: "2024-12-15",
          comment:
            "Youth has shown consistent use of this technique during stressful situations",
        },
        {
          id: 2,
          date: "2025-01-10",
          comment: "Effectiveness improving with practice",
        },
      ],
    },
    {
      id: 2,
      dateReported: "2024-12-05",
      lastITPInclusion: "2025-01-15",
      copingSkill: "Journaling emotions",
      description: "Daily journaling to process emotions and identify triggers",
      effectiveWhen: "Processing complex emotions",
      reportedBy: "Michael Chen",
      createdBy: "Sarah Johnson",
      comments: [],
    },
    {
      id: 3,
      dateReported: "2024-12-10",
      lastITPInclusion: "2025-01-15",
      copingSkill: "Progressive muscle relaxation",
      description:
        "Systematic tension and release of muscle groups for relaxation",
      effectiveWhen: "Physical tension and stress",
      reportedBy: "Dr. Emily Torres",
      createdBy: "Sarah Johnson",
      comments: [],
    },
    {
      id: 4,
      dateReported: "2024-12-12",
      lastITPInclusion: "2025-01-15",
      copingSkill: "Calling a trusted friend",
      description: "Reaching out to peer support when needing to talk",
      effectiveWhen: "Feeling isolated or lonely",
      reportedBy: "Michael Chen",
      createdBy: "Sarah Johnson",
      comments: [],
    },
  ])
  const [showAddCopingSkill, setShowAddCopingSkill] = useState(false)
  const [showAddCopingSkillModal, setShowAddCopingSkillModal] = useState(false)
  const [newCopingSkill, setNewCopingSkill] = useState({
    dateReported: "",
    lastITPInclusion: "",
    copingSkill: "",
    description: "",
    effectiveWhen: "",
    reportedBy: "",
    createdBy: "",
  })
  const [editingCopingSkillId, setEditingCopingSkillId] =
    useState<number | null>(null)
  const [showEditCopingSkillModal, setShowEditCopingSkillModal] =
    useState(false)
  const [editCopingSkillData, setEditCopingSkillData] = useState({
    dateReported: "",
    lastITPInclusion: "",
    copingSkill: "",
    description: "",
    effectiveWhen: "",
    reportedBy: "",
    createdBy: "",
    comments: [],
  })
  const [newCopingSkillComment, setNewCopingSkillComment] = useState({
    date: "",
    comment: "",
  })
  const [editingCopingSkillCommentId, setEditingCopingSkillCommentId] =
    useState<number | null>(null)

  // Triggers state
  const [triggers, setTriggers] = useState([
    {
      id: 1,
      dateReported: "2024-11-28",
      lastITPInclusion: "2025-01-15",
      trigger: "Conflict with parents",
      description:
        "Arguments with parents about rules and expectations lead to heightened stress and anxiety",
      relatedCopingSkills: ["Deep breathing exercises", "Journaling emotions"],
      endDate: "",
      reportedBy: "Dr. Emily Torres",
      createdBy: "Sarah Johnson",
      comments: [
        {
          id: 1,
          date: "2024-12-15",
          comment:
            "Trigger intensity has decreased with consistent use of coping strategies",
          createdBy: "Dr. Emily Torres",
          createdAt: "2024-12-15T10:30:00",
        },
      ],
    },
    {
      id: 2,
      dateReported: "2024-12-02",
      lastITPInclusion: "2025-01-15",
      trigger: "Academic pressure",
      description:
        "Feeling overwhelmed by schoolwork and deadlines triggers avoidance behaviors",
      relatedCopingSkills: ["Progressive muscle relaxation"],
      endDate: "",
      reportedBy: "Michael Chen",
      createdBy: "Sarah Johnson",
      comments: [],
    },
    {
      id: 3,
      dateReported: "2024-12-08",
      lastITPInclusion: "2025-01-15",
      trigger: "Social rejection",
      description:
        "Perceived or actual rejection by peers leads to isolation and negative self-talk",
      relatedCopingSkills: ["Journaling emotions", "Calling a trusted friend"],
      endDate: "",
      reportedBy: "Dr. Emily Torres",
      createdBy: "Sarah Johnson",
      comments: [
        {
          id: 1,
          date: "2024-12-20",
          comment:
            "Youth reports improved ability to identify and respond to this trigger",
          createdBy: "Michael Chen",
          createdAt: "2024-12-20T14:15:00",
        },
        {
          id: 2,
          date: "2024-12-28",
          comment:
            "Continue monitoring peer relationships and social interactions",
          createdBy: "Dr. Emily Torres",
          createdAt: "2024-12-28T09:45:00",
        },
      ],
    },
  ])
  const [showAddTrigger, setShowAddTrigger] = useState(false)
  const [showAddTriggerModal, setShowAddTriggerModal] = useState(false)
  const [newTrigger, setNewTrigger] = useState({
    dateReported: "",
    lastITPInclusion: "",
    trigger: "",
    description: "",
    relatedCopingSkills: [] as string[],
    endDate: "",
    reportedBy: "",
    createdBy: "",
  })
  const [editingTriggerId, setEditingTriggerId] = useState<number | null>(null)
  const [showEditTriggerModal, setShowEditTriggerModal] = useState(false)
  const [editTriggerData, setEditTriggerData] = useState({
    dateReported: "",
    lastITPInclusion: "",
    trigger: "",
    description: "",
    relatedCopingSkills: [] as string[],
    endDate: "",
    reportedBy: "",
    createdBy: "",
    comments: [],
  })
  const [newTriggerComment, setNewTriggerComment] = useState({
    date: "",
    comment: "",
  })
  const [editingTriggerCommentId, setEditingTriggerCommentId] =
    useState<number | null>(null)

  // Supplemental Plans state
  const [supplementalPlans, setSupplementalPlans] = useState(
    supplementalOnly
      ? [
          // Community Care "Plans" sample rows (prototype data): only the two
          // plan types offered there.
          {
            id: 1,
            startDate: "2026-09-01",
            member: "Maya Patel (Housing Coordinator)",
            planType: "Scholarship Agreement",
            description:
              "Tuition support for the fall semester at the community college, renewed each term with good standing",
            reEvaluationDate: "2026-12-15",
            endDate: "2027-05-31",
          },
          {
            id: 2,
            startDate: "2026-08-15",
            member: "Dr. Samuel Brooks (Therapist)",
            planType: "Community Launch Plan",
            description:
              "Move-out plan covering housing search, monthly budget and job applications before launch",
            reEvaluationDate: "2026-11-15",
            endDate: "2027-02-28",
          },
          {
            id: 3,
            startDate: "2026-06-01",
            member: "Jordan Ellis (Vocation Coach)",
            planType: "Scholarship Agreement",
            description:
              "Certification program scholarship for a food handler and safety course",
            reEvaluationDate: "2026-09-01",
            endDate: "2026-12-31",
          },
          {
            id: 4,
            startDate: "2026-10-01",
            member: "Rachel Nguyen (Care Manager)",
            planType: "Community Launch Plan",
            description:
              "Weekly check-ins with care manager and transit plan for the new apartment",
            reEvaluationDate: "2027-01-05",
            endDate: "2027-06-30",
          },
        ]
      : [
          {
            id: 1,
            startDate: "2024-11-15",
            planType: "Safety Plan",
            description:
              "Comprehensive safety protocols for crisis situations including contact numbers and coping strategies",
            reEvaluationDate: "2024-12-01",
            endDate: "2025-06-01",
          },
          {
            id: 2,
            startDate: "2024-11-15",
            planType: "Crisis Intervention Plan",
            description:
              "Step-by-step procedures for managing acute mental health crises with designated response team",
            reEvaluationDate: "2024-12-01",
            endDate: "2025-06-01",
          },
          {
            id: 3,
            startDate: "2024-11-20",
            planType: "Family Support Plan",
            description:
              "Structured family engagement activities and communication guidelines to strengthen support system",
            reEvaluationDate: "2024-12-05",
            endDate: "2025-06-05",
          },
          {
            id: 4,
            startDate: "2024-11-25",
            planType: "Educational Support Plan",
            description:
              "Academic accommodations and tutoring schedule aligned with IEP goals",
            reEvaluationDate: "2024-12-10",
            endDate: "2025-05-30",
          },
        ],
  )
  const [showAddPlan, setShowAddPlan] = useState(false)
  const [showEditPlanModal, setShowEditPlanModal] = useState(false)
  const [newPlan, setNewPlan] = useState({
    startDate: "",
    planType: "",
    description: "",
    reEvaluationDate: "",
    endDate: "",
  })

  // ── Add Plan Modal (3-tab or 4-tab for Academic Service Plan) ────────────
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false)
  const [addPlanTab, setAddPlanTab] =
    useState<"overview" | "plan-details" | "services" | "progress">("overview")

  const PLAN_TYPES = [
    "Program Agreement",
    "ECR Agreement",
    "Harm Risk Assessment",
    "IEP",
    "504",
    "No Harm Contract",
    "Relapse Prevention Plan",
    "Self Harm Safety Plan",
    "Suicide Prevention Agreement",
    "Academic Service Plan",
    "Strengths Assessment",
    "Scholarship Agreement",
    "Community Launch Plan",
    "School Safety Plan",
    STUDY_TIME_PLAN,
  ]

  const AGREEMENT_TYPES = [
    "Safety",
    "Hygiene",
    "Budgeting",
    "Behavior",
    "Education - School",
    "Employment",
    "Other",
  ]

  const SIGNATURE_ROLES = [
    "Director – Youth Programs",
    "Program Manager",
    "Program Coordinator",
    "Youth",
    "Parent/Guardian",
    "Therapist",
    "Youth Care Supervisor",
    "Youth Care Worker",
    "School Resources Coordinator",
    "Learning Center and Tutoring Coordinator",
    "Career Resources Coordinator",
    "Coordinator – ECR",
    "Director – ECR",
    "Advocate",
    "Day Coordinator",
    "Mileu Supervisor",
    "Community Care Scholar",
    "Care Manager",
  ]

  // Plans that require the Required Signatures section
  const PLANS_WITH_SIGNATURES = new Set([
    "Program Agreement",
    "ECR Agreement",
    "No Harm Contract",
    "Relapse Prevention Plan",
    "Self Harm Safety Plan",
    "Suicide Prevention Agreement",
    "Community Launch Plan",
  ])

  // ── Strength Assessment category options ──────────────────────────────────
  const SA_CATEGORIES = [
    "Daily Living Situation",
    "Financial/Insurance",
    "Health",
    "Leisure/Recreation",
    "Scholarship",
    "Social Supports",
    "Spirituality",
    "Vocational/Educational",
  ]

  // ── Community Launch Plan domain options ──────────────────────────────────
  const CLP_DOMAINS = [
    "Daily Living Skills",
    "CC_Transportation",
    "CC_Health",
    "CC_Food",
    "CC_Clothing",
    "CC_Shelter",
    "CC_Legal",
    "CC_Employment",
    "CC_Education",
    "CC_Financial",
    "CC_Social Support",
    "CC_Mental Health",
    "CC_Substance Abuse",
    "CC_Family Reunification",
    "CC_Independent Living",
    "CC_Recreation",
    "CC_Spiritual",
    "CC_Cultural",
    "CC_Technology",
    "CC_Communication",
    "CC_Safety",
    "CC_Self Care",
    "CC_Time Management",
    "CC_Conflict Resolution",
    "CC_Decision Making",
    "CC_Goal Setting",
    "CC_Problem Solving",
    "CC_Advocacy",
    "CC_Community Resources",
    "CC_Other",
  ]

  // ── Academic Service Plan options ──────────────────────────────────────────
  const ASP_GRADES = [
    "Kindergarten",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
    "Post Secondary",
    "Grade 13",
    "Grade 14",
    "Grade 15",
    "Grade 16",
    "Grade 17",
    "Grade 18",
    "Grade 19",
  ]

  const ASP_REASONS = [
    "Cognitive Impairment",
    "Emotional Disturbance",
    "Hearing Impairment",
    "Physical Impairment",
    "Multiple Disabilities",
    "Specific Learning Disability",
    "Speech or Language Impairment",
    "Other Health Impairment",
    "Autism Spectrum Disorder",
  ]

  const ASP_SERVICES = [
    "Counseling",
    "Medical",
    "Physical and Occupational Therapy",
    "Recreation",
    "School Health",
    "Social Work",
    "Speech-Language Pathology / Audiology",
    "Transportation",
    "Other",
    "Psychological",
  ]

  const defaultPlanForm = {
    // Overview
    planType: "",
    startDate: "",
    endDate: "",
    reEvalDates: ["", "", ""],
    description: "",
    signatures: SIGNATURE_ROLES.map((role) => ({ role, numSignatures: "" })),
    // Study Time Plan
    ...STUDY_TIME_PLAN_DEFAULTS,
    // Plan Details (generic)
    agreementType: "",
    agreementTypeOther: "",
    reasonForAgreement: "",
    previousSupports: "",
    youthCommitsTo: "",
    supportSystemHelp: "",
    expectedBenefits: "",
    expectedConsequences: "",
    // ── HRA-specific Plan Details ────────────────────────────────────────
    hra_typeOfHarm:
      "" as "" | "Self – Suicide" | "Self – Harm" | "Others – Harm",
    // Thought history
    hra_firstTimeThoughts: "",
    hra_lastTimeThoughts: "",
    hra_frequencyThoughts: "",
    // Triggers (multi-entry)
    hra_triggers: [] as {
      id: number
      text: string
      editing: boolean
      draft: string
    }[],
    hra_newTrigger: "",
    // Intensity
    hra_intensity: "",
    // Risk Indicators
    hra_planToHarm: "" as "" | "Yes" | "No" | "Unknown",
    hra_planToHarmDetails: "",
    hra_weaponAccess: "" as "" | "Yes" | "No" | "Unknown",
    hra_weaponAccessDetails: "",
    hra_hopelessnessLevel:
      "" as "" | "None" | "Mild" | "Moderate" | "Severe" | "Unknown",
    hra_hopelessnessDetails: "",
    // Protective factors (multi-entry)
    hra_strengths: [] as {
      id: number
      text: string
      editing: boolean
      draft: string
    }[],
    hra_newStrength: "",
    hra_resources: [] as {
      id: number
      text: string
      editing: boolean
      draft: string
    }[],
    hra_newResource: "",
    // Safety planning
    hra_keepYouthNow: "",
    hra_keepYouthTomorrow: "",
    // Commitment
    hra_verbalSafetyPlan: "" as "" | "Yes" | "No" | "Unknown",
    hra_verbalSafetyPlanDetails: "",
    // Linking
    hra_associatedAgreement: "",
    // Others – Harm only
    hra_planToHarmOthers: "" as "" | "Yes" | "No" | "Unknown",
    hra_whoYouthPlansToHarm: "",
    hra_dutyToWarn: "" as "" | "Yes" | "No",
    hra_dutyToWarnDetails: "",
    hra_likelihood:
      "" as "" | "Low" | "Moderate" | "High" | "Imminent" | "Unknown",
    // ── Strength Assessment Plan Details ────────────────────────────────────
    sa_entries: [] as {
      id: number
      category: string
      member: string
      family: string
    }[],
    sa_entryModalOpen: false,
    sa_editingEntryId: null as number | null,
    sa_entryCategory: "",
    sa_entryMember: "",
    sa_entryFamily: "",
    // Summary fields
    sa_summaryImpressions: "",
    sa_collateralInfo: "",
    // Priorities grid
    sa_priorities: [] as { id: number; order: number; details: string }[],
    sa_priorityModalOpen: false,
    sa_editingPriorityId: null as number | null,
    sa_priorityOrder: "",
    sa_priorityDetails: "",
    // ── Community Launch Plan Details ─────────────────────────────────────────
    clp_entries: [] as {
      id: number
      domain: string
      content: string
      timeframe: string
    }[],
    clp_entryModalOpen: false,
    clp_editingEntryId: null as number | null,
    clp_entryDomain: "",
    clp_entryContent: "",
    clp_entryTimeframe: "",
    // ── Academic Service Plan Details ─────────────────────────────────────────
    // Overview - Review Dates
    reviewDates: ["", "", ""],
    // Plan Details - School Information
    asp_school: "",
    asp_schoolType: "",
    asp_gradeAtStart: "",
    // Plan Details - Reason for Plan
    asp_reasons: [] as { id: number; reason: string }[],
    asp_reasonModalOpen: false,
    asp_editingReasonId: null as number | null,
    asp_selectedReasons: [] as string[],
    // Plan Details - Academic & Support Needs
    asp_academicNeeds: "",
    asp_behaviorNeeds: "",
    asp_accommodations: "",
    asp_testing: "",
    asp_showInstructions: false,
    asp_instructionsSection:
      "" as "" | "academic" | "behavior" | "accommodations" | "testing",
    // Services Tab
    asp_breakdownOfMinutes: "",
    asp_services: [] as { id: number; serviceName: string }[],
    asp_serviceModalOpen: false,
    asp_editingServiceId: null as number | null,
    asp_selectedServices: [] as string[],
    // ── IEP / 504 Plan Details ────────────────────────────────────────────────
    iep_school: "",
    iep_schoolType: "",
    iep_district: "",
    iep_gradeAtStart: "",
    iep_reasons: [] as { id: number; reason: string }[],
    iep_reasonModalOpen: false,
    iep_editingReasonId: null as number | null,
    iep_selectedReason: "",
    iep_academicNeeds: "",
    iep_behaviorNeeds: "",
    iep_accommodations: "",
    iep_testing: "",
    iep_documents: [] as {
      id: number
      name: string
      uploadDate: string
      uploadedBy: string
      size: string
    }[],
    // ── Self Harm Safety Plan ────────────────────────────────────────────────
    shsp_copingSkills: [] as { id: number; skill: string }[],
    shsp_copingSkillModalOpen: false,
    shsp_editingSkillId: null as number | null,
    shsp_skillText: "",
    // ── Scholarship Agreement ─────────────────────────────────────────────
    sa_copingSkills: [] as { id: number; skill: string }[],
    sa_copingSkillModalOpen: false,
    sa_editingSkillId: null as number | null,
    sa_skillText: "",
    // Progress Tracking
    progressEntries: [] as {
      id: number
      date: string
      comments: string
      createdBy: string
    }[],
    newProgressDate: "",
    newProgressComments: "",
    newProgressCreatedBy: "",
  }

  const [planForm, setPlanForm] = useState(defaultPlanForm)

  const resetAddPlanModal = () => {
    setAddPlanTab("overview")
    setPlanForm(defaultPlanForm)
    setIsAddPlanModalOpen(false)
  }
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null)
  const [editPlanData, setEditPlanData] = useState({
    startDate: "",
    planType: "",
    description: "",
    reEvaluationDate: "",
    endDate: "",
  })

  // Trauma History state
  const [traumaHistory, setTraumaHistory] = useState([
    {
      id: 1,
      dateReported: "2024-11-15",
      lastItpInclusion: "2024-12-01",
      subject: "Youth",
      traumaType: "Verbal Abuse",
      ageOfFirstOccurrence: "Known Age",
      knownAgeFirst: "5",
      ongoing: "No",
      ageOfLastOccurrence: "",
      knownAgeLast: "",
      developmentStagesImpacted: [
        { id: 1, stage: "Early Childhood (1-3 Years)" },
        { id: 2, stage: "Childhood (4-10 Years)" },
      ],
      impactOnYouth: [
        {
          id: 1,
          date: "2024-11-20",
          description:
            "Youth exhibits anxiety and difficulty trusting authority figures",
        },
      ],
      reportedBy: [
        { id: 1, name: "Dr. Sarah Martinez", relationship: "Therapist" },
      ],
      dcfsHotlineRequired: "No",
      comment: "Youth is receiving ongoing therapy to address emotional trauma",
      description:
        "Youth reports ongoing verbal abuse and emotional neglect from primary caregiver during early childhood. Includes consistent criticism, belittling, and emotional unavailability.",
      createdBy: "Jennifer Williams, LCSW",
      comments: [
        {
          id: 1,
          date: "2024-12-01",
          comment: "Youth showing progress in therapy sessions",
          createdBy: "Dr. Sarah Martinez",
          createdAt: "2024-12-01T10:00:00",
        },
      ],
    },
    {
      id: 2,
      dateReported: "2024-11-10",
      lastItpInclusion: "2024-12-01",
      subject: "Family",
      traumaType: "Witness to Domestic Violence",
      ageOfFirstOccurrence: "Known Age",
      knownAgeFirst: "8",
      ongoing: "Yes",
      ageOfLastOccurrence: "Known Age",
      knownAgeLast: "11",
      developmentStagesImpacted: [
        { id: 1, stage: "Childhood (4-10 Years)" },
        { id: 2, stage: "Adolescence (11-18 Years)" },
      ],
      impactOnYouth: [
        {
          id: 1,
          date: "2024-11-15",
          description:
            "Youth experiences heightened anxiety during conflict situations",
        },
      ],
      reportedBy: [
        { id: 1, name: "Maria Rodriguez", relationship: "School Counselor" },
      ],
      dcfsHotlineRequired: "Yes",
      comment: "Safety plan in place for family visits",
      description:
        "Youth witnessed multiple physical altercations between parents from ages 8-11. Events occurred approximately monthly and included yelling, pushing, and hitting. Youth would hide in bedroom during incidents.",
      createdBy: "Jennifer Williams, LCSW",
      comments: [],
    },
    {
      id: 3,
      dateReported: "2024-10-28",
      lastItpInclusion: "2024-12-05",
      subject: "Youth",
      traumaType: "Physical Abuse",
      ageOfFirstOccurrence: "Known Age",
      knownAgeFirst: "12",
      ongoing: "No",
      ageOfLastOccurrence: "",
      knownAgeLast: "",
      developmentStagesImpacted: [
        { id: 1, stage: "Adolescence (11-18 Years)" },
      ],
      impactOnYouth: [
        {
          id: 1,
          date: "2024-11-01",
          description: "Trust issues with adult authority figures noted",
        },
      ],
      reportedBy: [
        { id: 1, name: "Dr. Michael Chen", relationship: "Pediatrician" },
      ],
      dcfsHotlineRequired: "Yes",
      comment: "DCFS investigation completed, youth in safe placement",
      description:
        "Youth disclosed inappropriate physical discipline that escalated over time, leaving visible marks. Incidents occurred during middle school years when academic performance declined.",
      createdBy: "Tom Anderson, MSW",
      comments: [
        {
          id: 1,
          date: "2024-11-05",
          comment: "Medical evaluation completed, no current physical concerns",
          createdBy: "Dr. Michael Chen",
          createdAt: "2024-11-05T14:30:00",
        },
      ],
    },
  ])
  const [showAddTrauma, setShowAddTrauma] = useState(false)
  const [newTrauma, setNewTrauma] = useState({
    dateReported: "",
    lastItpInclusion: "",
    subject: "",
    traumaType: "",
    ageOfFirstOccurrence: "",
    knownAgeFirst: "",
    ongoing: "",
    ageOfLastOccurrence: "",
    knownAgeLast: "",
    developmentStagesImpacted: [] as { id: number; stage: string }[],
    impactOnYouth: [] as { id: number; date: string; description: string }[],
    reportedBy: [] as { id: number; name: string; relationship: string }[],
    dcfsHotlineRequired: "",
    comment: "",
    description: "",
    createdBy: "",
  })
  const [editingTraumaId, setEditingTraumaId] = useState<number | null>(null)
  const [editTraumaData, setEditTraumaData] = useState({
    dateReported: "",
    lastItpInclusion: "",
    subject: "",
    traumaType: "",
    ageOfFirstOccurrence: "",
    knownAgeFirst: "",
    ongoing: "",
    ageOfLastOccurrence: "",
    knownAgeLast: "",
    developmentStagesImpacted: [] as { id: number; stage: string }[],
    impactOnYouth: [] as { id: number; date: string; description: string }[],
    reportedBy: [] as { id: number; name: string; relationship: string }[],
    dcfsHotlineRequired: "",
    comment: "",
    description: "",
    createdBy: "",
    comments: [] as any[],
  })
  const [expandedTraumaId, setExpandedTraumaId] = useState<number | null>(null)

  // Trauma nested table states
  const [showAddDevStage, setShowAddDevStage] = useState(false)
  const [newDevStage, setNewDevStage] = useState("")
  const [showAddImpact, setShowAddImpact] = useState(false)
  const [newImpact, setNewImpact] = useState({ date: "", description: "" })
  const [showAddReporter, setShowAddReporter] = useState(false)
  const [newReporter, setNewReporter] = useState({ name: "", relationship: "" })
  const [showAddTraumaComment, setShowAddTraumaComment] = useState(false)
  const [newTraumaCommentData, setNewTraumaCommentData] = useState({
    date: "",
    comment: "",
  })

  // Comment management state
  const [showCommentForm, setShowCommentForm] = useState<number | null>(null)
  const [newGoalComment, setNewGoalComment] = useState("")
  const [expandedComments, setExpandedComments] = useState<number[]>([])
  const [commentsModalOpen, setCommentsModalOpen] = useState(false)
  const [selectedGoalForComments, setSelectedGoalForComments] =
    useState<any>(null)

  const handleDeleteGoal = (id: number) => {
    // Also delete child goals if deleting a parent
    const goal = goals.find((g) => g.id === id)
    if (goal && goal.parentId === null) {
      setGoals(goals.filter((g) => g.id !== id && g.parentId !== id))
    } else {
      setGoals(goals.filter((g) => g.id !== id))
    }
  }

  const handleEditGoal = (id: number) => {
    const goal = goals.find((g) => g.id === id)
    if (goal) {
      setEditingGoalId(id)
      setEditGoalData({
        goal: goal.goal,
        goalText: goal.goalText || "",
        relatedPTPStatement: goal.relatedPTPStatement || "",
        reasonForGoal: goal.reasonForGoal || "",
        pointPersonName: goal.pointPersonName || "",
        outcomeDomain: goal.outcomeDomain || "",
        startDate: goal.startDate || "",
        targetDuration: goal.targetDuration || "",
        targetEndDate: goal.targetEndDate || "",
        endDate: goal.endDate || "",
        targetDate: goal.targetDate,
        category: goal.category,
        progress: goal.progress,
        description: goal.description || "",
        enrollee: goal.enrollee || "",
        youthNotes: goal.youthNotes || "",
        parentId: goal.parentId,
      })
      setEditGoalType(goal.parentId ? "intermediate" : "major")
      setShowEditGoalModal(true)
    }
  }

  const handleSaveGoal = () => {
    if (!editGoalData.goal || !editGoalData.targetDate) return

    setGoals(
      goals.map((g) => {
        if (g.id === editingGoalId) {
          return {
            ...g,
            goal: editGoalData.goal,
            goalText: editGoalData.goalText,
            relatedPTPStatement: editGoalData.relatedPTPStatement,
            reasonForGoal: editGoalData.reasonForGoal,
            pointPersonName: editGoalData.pointPersonName,
            outcomeDomain: editGoalData.outcomeDomain,
            startDate: editGoalData.startDate,
            targetDuration: editGoalData.targetDuration,
            targetEndDate: editGoalData.targetEndDate,
            endDate: editGoalData.endDate,
            targetDate: editGoalData.targetDate,
            category: editGoalData.category,
            progress: editGoalData.progress,
            description: editGoalData.description,
            enrollee: editGoalData.enrollee,
            youthNotes: editGoalData.youthNotes,
            status: "Active",
          }
        }
        return g
      }),
    )
    setEditingGoalId(null)
    setEditGoalData({
      goal: "",
      goalText: "",
      relatedPTPStatement: "",
      reasonForGoal: "",
      pointPersonName: "",
      outcomeDomain: "",
      startDate: "",
      targetDuration: "",
      targetEndDate: "",
      endDate: "",
      targetDate: "",
      category: "",
      progress: 0,
      description: "",
      enrollee: "",
      youthNotes: "",
      parentId: null,
    })
  }

  const handleCancelEditGoal = () => {
    setEditingGoalId(null)
    setShowEditGoalModal(false)
    setEditGoalData({
      goal: "",
      goalText: "",
      relatedPTPStatement: "",
      reasonForGoal: "",
      pointPersonName: "",
      outcomeDomain: "",
      startDate: "",
      targetDuration: "",
      targetEndDate: "",
      endDate: "",
      targetDate: "",
      category: "",
      progress: 0,
      description: "",
      enrollee: "",
      youthNotes: "",
      parentId: null,
    })
  }

  const handleDeleteStrength = (id: number) => {
    setStrengths(strengths.filter((s) => s.id !== id))
  }

  const handleDeleteCopingSkill = (id: number) => {
    setCopingSkills(copingSkills.filter((cs) => cs.id !== id))
  }

  const handleDeleteTrigger = (id: number) => {
    setTriggers(triggers.filter((t) => t.id !== id))
  }

  const handleDeletePlan = (id: number) => {
    setSupplementalPlans(supplementalPlans.filter((p) => p.id !== id))
  }

  const handleEditStrength = (strength: any) => {
    setEditStrengthData({
      ...strength,
      comments: strength.comments || [],
    })
    setEditingStrengthId(strength.id)
    setShowEditStrengthModal(true)
    setNewStrengthComment({ date: "", comment: "" })
  }

  const handleUpdateStrength = () => {
    if (
      !editStrengthData.strength ||
      !editStrengthData.subject ||
      !editStrengthData.dateReported
    )
      return

    setStrengths(
      strengths.map((s) =>
        s.id === editingStrengthId
          ? { ...editStrengthData, id: editingStrengthId }
          : s,
      ),
    )
    setEditStrengthData({
      dateReported: "",
      lastITPInclusion: "",
      subject: "",
      strength: "",
      description: "",
      reportedBy: "",
      createdBy: "",
      comments: [],
    })
    setEditingStrengthId(null)
    setShowEditStrengthModal(false)
    setNewStrengthComment({ date: "", comment: "" })
  }

  const handleCancelEditStrength = () => {
    setEditStrengthData({
      dateReported: "",
      lastITPInclusion: "",
      subject: "",
      strength: "",
      description: "",
      reportedBy: "",
      createdBy: "",
      comments: [],
    })
    setEditingStrengthId(null)
    setShowEditStrengthModal(false)
    setNewStrengthComment({ date: "", comment: "" })
    setEditingCommentId(null)
  }

  const handleAddStrengthComment = () => {
    if (!newStrengthComment.date || !newStrengthComment.comment) return

    const newComment = {
      id:
        Math.max(
          ...(editStrengthData.comments?.map((c: any) => c.id) || [0]),
          0,
        ) + 1,
      ...newStrengthComment,
      createdBy: getDemoUserName(),
      createdAt: new Date().toISOString(),
    }

    setEditStrengthData({
      ...editStrengthData,
      comments: [...(editStrengthData.comments || []), newComment],
    })
    setNewStrengthComment({ date: "", comment: "" })
  }

  const handleDeleteStrengthComment = (commentId: number) => {
    setEditStrengthData({
      ...editStrengthData,
      comments:
        editStrengthData.comments?.filter((c: any) => c.id !== commentId) || [],
    })
  }

  const handleEditCopingSkill = (skill: any) => {
    setEditCopingSkillData({
      ...skill,
      comments: skill.comments || [],
    })
    setEditingCopingSkillId(skill.id)
    setShowEditCopingSkillModal(true)
    setNewCopingSkillComment({ date: "", comment: "" })
  }

  const handleUpdateCopingSkill = () => {
    if (!editCopingSkillData.dateReported || !editCopingSkillData.copingSkill)
      return

    setCopingSkills(
      copingSkills.map((cs) =>
        cs.id === editingCopingSkillId
          ? { ...editCopingSkillData, id: editingCopingSkillId }
          : cs,
      ),
    )
    setEditCopingSkillData({
      dateReported: "",
      lastITPInclusion: "",
      copingSkill: "",
      description: "",
      effectiveWhen: "",
      reportedBy: "",
      createdBy: "",
      comments: [],
    })
    setEditingCopingSkillId(null)
    setShowEditCopingSkillModal(false)
    setNewCopingSkillComment({ date: "", comment: "" })
  }

  const handleCancelEditCopingSkill = () => {
    setEditCopingSkillData({
      dateReported: "",
      lastITPInclusion: "",
      copingSkill: "",
      description: "",
      effectiveWhen: "",
      reportedBy: "",
      createdBy: "",
      comments: [],
    })
    setEditingCopingSkillId(null)
    setShowEditCopingSkillModal(false)
    setNewCopingSkillComment({ date: "", comment: "" })
    setEditingCopingSkillCommentId(null)
  }

  const handleAddCopingSkillComment = () => {
    if (!newCopingSkillComment.date || !newCopingSkillComment.comment) return

    const newId =
      Math.max(
        ...(editCopingSkillData.comments?.map((c: any) => c.id) || [0]),
        0,
      ) + 1
    const newComment = {
      id: newId,
      date: newCopingSkillComment.date,
      comment: newCopingSkillComment.comment,
    }

    setEditCopingSkillData({
      ...editCopingSkillData,
      comments: [...(editCopingSkillData.comments || []), newComment],
    })
    setNewCopingSkillComment({ date: "", comment: "" })
  }

  const handleDeleteCopingSkillComment = (commentId: number) => {
    setEditCopingSkillData({
      ...editCopingSkillData,
      comments:
        editCopingSkillData.comments?.filter((c: any) => c.id !== commentId) ||
        [],
    })
  }

  const handleEditCopingSkillComment = (comment: any) => {
    setNewCopingSkillComment({ date: comment.date, comment: comment.comment })
    setEditingCopingSkillCommentId(comment.id)
  }

  const handleUpdateCopingSkillComment = () => {
    if (!newCopingSkillComment.date || !newCopingSkillComment.comment) return

    setEditCopingSkillData({
      ...editCopingSkillData,
      comments:
        editCopingSkillData.comments?.map((c: any) =>
          c.id === editingCopingSkillCommentId
            ? {
                ...c,
                date: newCopingSkillComment.date,
                comment: newCopingSkillComment.comment,
              }
            : c,
        ) || [],
    })
    setNewCopingSkillComment({ date: "", comment: "" })
    setEditingCopingSkillCommentId(null)
  }

  const handleCancelEditCopingSkillComment = () => {
    setNewCopingSkillComment({ date: "", comment: "" })
    setEditingCopingSkillCommentId(null)
  }

  const handleEditTrigger = (trigger: any) => {
    setEditTriggerData({
      ...trigger,
      comments: trigger.comments || [],
    })
    setEditingTriggerId(trigger.id)
    setShowEditTriggerModal(true)
  }

  const handleUpdateTrigger = () => {
    if (!editTriggerData.dateReported || !editTriggerData.trigger) return

    setTriggers(
      triggers.map((t) =>
        t.id === editingTriggerId
          ? { ...editTriggerData, id: editingTriggerId }
          : t,
      ),
    )
    setEditTriggerData({
      dateReported: "",
      lastITPInclusion: "",
      trigger: "",
      description: "",
      relatedCopingSkills: [],
      endDate: "",
      reportedBy: "",
      createdBy: "",
      comments: [],
    })
    setEditingTriggerId(null)
    setShowEditTriggerModal(false)
  }

  const handleCancelEditTrigger = () => {
    setEditTriggerData({
      dateReported: "",
      lastITPInclusion: "",
      trigger: "",
      description: "",
      relatedCopingSkills: [],
      endDate: "",
      reportedBy: "",
      createdBy: "",
      comments: [],
    })
    setEditingTriggerId(null)
    setShowEditTriggerModal(false)
    setNewTriggerComment({ date: "", comment: "" })
    setEditingTriggerCommentId(null)
  }

  const handleAddTriggerComment = () => {
    if (!newTriggerComment.date || !newTriggerComment.comment) return

    const newId =
      Math.max(...(editTriggerData.comments?.map((c: any) => c.id) || [0]), 0) +
      1
    const newComment = {
      id: newId,
      date: newTriggerComment.date,
      comment: newTriggerComment.comment,
      createdBy: getDemoUserName(),
      createdAt: new Date().toISOString(),
    }

    setEditTriggerData({
      ...editTriggerData,
      comments: [...(editTriggerData.comments || []), newComment],
    })
    setNewTriggerComment({ date: "", comment: "" })
  }

  const handleDeleteTriggerComment = (commentId: number) => {
    setEditTriggerData({
      ...editTriggerData,
      comments: editTriggerData.comments.filter((c: any) => c.id !== commentId),
    })
  }

  const handleEditPlan = (id: number) => {
    console.log("handleEditPlan called with id:", id)
    const plan = supplementalPlans.find((p) => p.id === id)
    console.log("Found plan:", plan)
    if (plan) {
      setEditingPlanId(id)
      setEditPlanData({
        startDate: plan.startDate,
        planType: plan.planType,
        description: plan.description,
        reEvaluationDate: plan.reEvaluationDate,
        endDate: plan.endDate,
      })
      console.log("Setting showEditPlanModal to true")
      setShowEditPlanModal(true)
    } else {
      console.log("Plan not found!")
    }
  }

  const handleSavePlan = () => {
    if (!editPlanData.planType || !editPlanData.description) return

    setSupplementalPlans(
      supplementalPlans.map((p) => {
        if (p.id === editingPlanId) {
          return {
            ...p,
            startDate: editPlanData.startDate,
            planType: editPlanData.planType,
            description: editPlanData.description,
            reEvaluationDate: editPlanData.reEvaluationDate,
            endDate: editPlanData.endDate,
          }
        }
        return p
      }),
    )
    setEditingPlanId(null)
    setEditPlanData({
      startDate: "",
      planType: "",
      description: "",
      reEvaluationDate: "",
      endDate: "",
    })
    setShowEditPlanModal(false)
  }

  const handleCancelEditPlan = () => {
    setEditingPlanId(null)
    setEditPlanData({
      startDate: "",
      planType: "",
      description: "",
      reEvaluationDate: "",
      endDate: "",
    })
    setShowEditPlanModal(false)
  }

  const handleDeleteTrauma = (id: number) => {
    setTraumaHistory(traumaHistory.filter((t) => t.id !== id))
  }

  const handleEditTrauma = (id: number) => {
    const trauma = traumaHistory.find((t) => t.id === id)
    if (trauma) {
      setEditingTraumaId(id)
      setEditTraumaData({
        dateReported: trauma.dateReported,
        lastItpInclusion: trauma.lastItpInclusion,
        subject: trauma.subject,
        traumaType: trauma.traumaType,
        ageOfFirstOccurrence: trauma.ageOfFirstOccurrence,
        knownAgeFirst: trauma.knownAgeFirst,
        ongoing: trauma.ongoing,
        ageOfLastOccurrence: trauma.ageOfLastOccurrence || "",
        knownAgeLast: trauma.knownAgeLast || "",
        developmentStagesImpacted: trauma.developmentStagesImpacted || [],
        impactOnYouth: trauma.impactOnYouth || [],
        reportedBy: trauma.reportedBy || [],
        dcfsHotlineRequired: trauma.dcfsHotlineRequired,
        comment: trauma.comment || "",
        description: trauma.description,
        createdBy: trauma.createdBy,
        comments: trauma.comments || [],
      })
    }
  }

  const handleSaveTrauma = () => {
    // Required field validation
    if (
      !editTraumaData.dateReported ||
      !editTraumaData.subject ||
      !editTraumaData.traumaType ||
      !editTraumaData.ageOfFirstOccurrence ||
      !editTraumaData.ongoing ||
      !editTraumaData.description ||
      !editTraumaData.dcfsHotlineRequired
    )
      return

    // Conditional validation: if Ongoing = Yes, then Age of Last Occurrence is required
    if (editTraumaData.ongoing === "Yes" && !editTraumaData.ageOfLastOccurrence)
      return

    setTraumaHistory(
      traumaHistory.map((t) => {
        if (t.id === editingTraumaId) {
          return {
            ...t,
            dateReported: editTraumaData.dateReported,
            lastItpInclusion: editTraumaData.lastItpInclusion,
            subject: editTraumaData.subject,
            traumaType: editTraumaData.traumaType,
            ageOfFirstOccurrence: editTraumaData.ageOfFirstOccurrence,
            knownAgeFirst: editTraumaData.knownAgeFirst,
            ongoing: editTraumaData.ongoing,
            ageOfLastOccurrence: editTraumaData.ageOfLastOccurrence,
            knownAgeLast: editTraumaData.knownAgeLast,
            developmentStagesImpacted: editTraumaData.developmentStagesImpacted,
            impactOnYouth: editTraumaData.impactOnYouth,
            reportedBy: editTraumaData.reportedBy,
            dcfsHotlineRequired: editTraumaData.dcfsHotlineRequired,
            comment: editTraumaData.comment,
            description: editTraumaData.description,
            createdBy: editTraumaData.createdBy,
            comments: editTraumaData.comments,
          }
        }
        return t
      }),
    )
    setEditingTraumaId(null)
    setEditTraumaData({
      dateReported: "",
      lastItpInclusion: "",
      subject: "",
      traumaType: "",
      ageOfFirstOccurrence: "",
      knownAgeFirst: "",
      ongoing: "",
      ageOfLastOccurrence: "",
      knownAgeLast: "",
      developmentStagesImpacted: [],
      impactOnYouth: [],
      reportedBy: [],
      dcfsHotlineRequired: "",
      comment: "",
      description: "",
      createdBy: "",
      comments: [],
    })
  }

  const handleCancelEditTrauma = () => {
    setEditingTraumaId(null)
    setEditTraumaData({
      dateReported: "",
      lastItpInclusion: "",
      subject: "",
      traumaType: "",
      ageOfFirstOccurrence: "",
      knownAgeFirst: "",
      ongoing: "",
      ageOfLastOccurrence: "",
      knownAgeLast: "",
      developmentStagesImpacted: [],
      impactOnYouth: [],
      reportedBy: [],
      dcfsHotlineRequired: "",
      comment: "",
      description: "",
      createdBy: "",
      comments: [],
    })
  }

  const handleDeleteModality = (id: string | number) => {
    if (ptpStoreMode) {
      if (!constituentYouth) return
      const result = deletePtp({ id: String(id), youthId: constituentYouth.id })
      if (!result.ok) toast.error(result.message)
      return
    }
    setTreatmentModalities(treatmentModalities.filter((m) => m.id !== id))
  }

  const handleEditModality = (modality: any) => {
    setEditingModalityId(modality.id)
    setNewModality({
      statement: modality.statement,
      outcomeDomains: modality.outcomeDomains || [],
      otherOutcomeDomain: modality.otherOutcomeDomain || "",
      startDate: modality.startDate,
      endDate: modality.endDate,
      goalsCompleted: modality.goalsCompleted,
      status: modality.status,
      comments: modality.comments || [],
    })
    setShowEditPTPModal(true)
  }

  const handleCancelEditModality = () => {
    setEditingModalityId(null)
    setNewModality({
      statement: "",
      outcomeDomains: [],
      otherOutcomeDomain: "",
      startDate: "",
      endDate: "",
      goalsCompleted: "",
      status: "New",
      comments: [],
    })
    setNewComment({ date: "", comment: "" })
    setEditingCommentId(null)
    setShowEditPTPModal(false)
    setShowAddPTPModal(false)
  }

  // Goal interaction handlers
  const toggleGoalExpansion = (goalId: number) => {
    setExpandedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId],
    )
  }

  const updateGoalProgress = (goalId: number, newProgress: number) => {
    setGoals(
      goals.map((g) => {
        if (g.id === goalId) {
          return {
            ...g,
            progress: newProgress,
            status:
              newProgress >= 75
                ? "Exceeding"
                : newProgress >= 50
                  ? "On Track"
                  : "In Progress",
          }
        }
        return g
      }),
    )
  }

  const calculateOverallProgress = () => {
    const parentGoals = goals.filter((g) => g.parentId === null)
    if (parentGoals.length === 0) return 0
    const totalProgress = parentGoals.reduce((sum, g) => sum + g.progress, 0)
    return Math.round(totalProgress / parentGoals.length)
  }

  // Add handlers
  const handleAddModality = () => {
    // Validation: Required fields
    if (!newModality.statement.trim()) {
      alert("Statement is required")
      return
    }
    if (
      !newModality.outcomeDomains ||
      newModality.outcomeDomains.length === 0
    ) {
      alert("At least one Outcome Domain is required")
      return
    }
    if (
      newModality.outcomeDomains.includes("Other") &&
      !newModality.otherOutcomeDomain.trim()
    ) {
      alert("Please specify the Other Outcome Domain")
      return
    }
    if (!newModality.startDate) {
      alert("Start Date is required")
      return
    }

    // Validate date format MM/DD/YYYY
    const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/
    if (!datePattern.test(newModality.startDate)) {
      alert("Start Date must be in MM/DD/YYYY format")
      return
    }
    if (newModality.endDate && !datePattern.test(newModality.endDate)) {
      alert("End Date must be in MM/DD/YYYY format")
      return
    }

    if (ptpStoreMode) {
      // Youth-owned PTP: persist first; on failure keep the dialog and
      // its draft open so the user can retry.
      if (!constituentYouth || ptpUnavailableReason) {
        toast.error(
          ptpUnavailableReason || "PTPs are unavailable for this profile.",
        )
        return
      }
      const result =
        editingModalityId !== null
          ? updatePtp({
              id: String(editingModalityId),
              youthId: constituentYouth.id,
              content: newModality,
            })
          : createPtp({
              id: newPtpId(),
              youthId: constituentYouth.id,
              content: newModality,
            })
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      setEditingModalityId(null)
    } else if (editingModalityId !== null) {
      // Update existing modality
      setTreatmentModalities(
        treatmentModalities.map((m) => {
          if (m.id === editingModalityId) {
            return {
              ...m,
              statement: newModality.statement,
              outcomeDomains: newModality.outcomeDomains,
              otherOutcomeDomain: newModality.otherOutcomeDomain,
              startDate: newModality.startDate,
              endDate: newModality.endDate,
              goalsCompleted: newModality.goalsCompleted,
              status: newModality.status,
              comments: newModality.comments,
            }
          }
          return m
        }),
      )
      setEditingModalityId(null)
    } else {
      // Add new modality
      const newId = Math.max(...treatmentModalities.map((m) => m.id), 0) + 1
      setTreatmentModalities([
        ...treatmentModalities,
        { id: newId, ...newModality },
      ])
    }

    setNewModality({
      statement: "",
      outcomeDomains: [],
      otherOutcomeDomain: "",
      startDate: "",
      endDate: "",
      goalsCompleted: "",
      status: "New",
      comments: [],
    })
    setNewComment({ date: "", comment: "" })
    setEditingCommentId(null)
    setShowAddPTPModal(false)
    setShowEditPTPModal(false)
  }

  // PTP Comment handlers
  const handleAddPTPComment = () => {
    if (!newComment.date || !newComment.comment.trim()) {
      alert("Both Date and Comment are required")
      return
    }

    // Validate date format MM/DD/YYYY
    const datePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/
    if (!datePattern.test(newComment.date)) {
      alert("Date must be in MM/DD/YYYY format")
      return
    }

    const commentId =
      editingCommentId !== null
        ? editingCommentId
        : Math.max(...(newModality.comments?.map((c) => c.id) || [0]), 0) + 1

    if (editingCommentId !== null) {
      // Edit existing comment
      setNewModality({
        ...newModality,
        comments: newModality.comments.map((c) =>
          c.id === editingCommentId
            ? { id: c.id, date: newComment.date, comment: newComment.comment }
            : c,
        ),
      })
      setEditingCommentId(null)
    } else {
      // Add new comment
      setNewModality({
        ...newModality,
        comments: [
          ...(newModality.comments || []),
          { id: commentId, date: newComment.date, comment: newComment.comment },
        ],
      })
    }

    setNewComment({ date: "", comment: "" })
  }

  const handleEditPTPComment = (comment: {
    id: number
    date: string
    comment: string
  }) => {
    setEditingCommentId(comment.id)
    setNewComment({ date: comment.date, comment: comment.comment })
  }

  const handleDeletePTPComment = (commentId: number) => {
    setNewModality({
      ...newModality,
      comments: newModality.comments.filter((c) => c.id !== commentId),
    })
  }

  const handleCancelPTPCommentEdit = () => {
    setEditingCommentId(null)
    setNewComment({ date: "", comment: "" })
  }

  const toggleOutcomeDomain = (domain: string) => {
    const currentDomains = newModality.outcomeDomains || []
    if (currentDomains.includes(domain)) {
      setNewModality({
        ...newModality,
        outcomeDomains: currentDomains.filter((d) => d !== domain),
      })
    } else {
      setNewModality({
        ...newModality,
        outcomeDomains: [...currentDomains, domain],
      })
    }
  }

  const handleSaveEditModality = () => {
    if (
      !editModality.statement ||
      !editModality.startDate ||
      editingModalityId === null
    )
      return

    setTreatmentModalities(
      treatmentModalities.map((m) => {
        if (m.id === editingModalityId) {
          return {
            ...m,
            statement: editModality.statement,
            outcomeDomains: editModality.outcomeDomains,
            startDate: editModality.startDate,
            endDate: editModality.endDate,
            goalsCompleted: editModality.goalsCompleted,
            status: editModality.status,
          }
        }
        return m
      }),
    )
    setEditingModalityId(null)
    setEditModality({
      statement: "",
      outcomeDomains: "",
      startDate: "",
      endDate: "",
      goalsCompleted: "",
      status: "In Progress",
    })
    setShowEditModality(false)
  }

  const handleAddGoal = () => {
    if (!newGoal.goal || !newGoal.category) return

    const newId = Math.max(...goals.map((g) => g.id), 0) + 1
    setGoals([
      ...goals,
      {
        id: newId,
        goal: newGoal.goal,
        goalText: newGoal.goalText || newGoal.goal,
        targetDate: newGoal.targetEndDate || newGoal.targetDate || "2025-12-31",
        category: newGoal.category,
        parentId: newGoal.parentId,
        progress: parseInt(newGoal.goalPercentage) || 0,
        status: "Active",
        description:
          newGoal.goalText || newGoal.description || "No description provided",
        enrollee: newGoal.enrollee || "Marcus Thompson",
        badgeType: newGoal.badgeType || "TOP GOAL DEFINITION",
        enrolleeCount: newGoal.enrolleeCount || 1,
        relatedPTPStatement: newGoal.relatedPTPStatement || "",
        reasonForGoal: newGoal.reasonForGoal || "",
        pointPersonName: newGoal.pointPersonName || "",
        outcomeDomain: newGoal.outcomeDomain || newGoal.category,
        startDate: newGoal.startDate || "",
        targetDuration: newGoal.targetDuration || "",
        targetEndDate: newGoal.targetEndDate || "",
        endDate: newGoal.endDate || "",
        goalPercentage: newGoal.goalPercentage || "0",
        comments: [],
      },
    ])
    setNewGoal({
      goal: "",
      goalText: "",
      relatedPTPStatement: "",
      reasonForGoal: "",
      pointPersonName: "",
      outcomeDomain: "",
      startDate: "",
      targetDuration: "",
      targetEndDate: "",
      endDate: "",
      goalPercentage: "",
      targetDate: "",
      category: "",
      parentId: null,
      progress: 0,
      description: "",
      enrollee: "",
      badgeType: "",
      enrolleeCount: 0,
    })
    setShowAddGoal(null)
  }

  const handleAddStrength = (data: any) => {
    const newId = Math.max(...strengths.map((s) => s.id), 0) + 1
    setStrengths([
      ...strengths,
      {
        id: newId,
        ...data,
        reportedBy: getDemoUserName(),
        createdBy: getDemoUserName(),
        comments: [],
      },
    ])
    setShowAddStrengthModal(false)
  }

  const handleCancelAddStrength = () => {
    setShowAddStrengthModal(false)
  }

  const handleAddCopingSkill = (data: {
    dateReported: string
    lastITPInclusion: string
    copingSkill: string
    description: string
    effectiveWhen: string
  }) => {
    const newId = Math.max(...copingSkills.map((c) => c.id), 0) + 1
    setCopingSkills([
      ...copingSkills,
      {
        id: newId,
        ...data,
        reportedBy: getDemoUserName(),
        createdBy: getDemoUserName(),
        comments: [],
      },
    ])
    setShowAddCopingSkillModal(false)
  }

  const handleCancelAddCopingSkill = () => {
    setShowAddCopingSkillModal(false)
  }

  const handleAddTrigger = (data: any) => {
    const newId = Math.max(...triggers.map((t) => t.id), 0) + 1
    setTriggers([
      ...triggers,
      {
        id: newId,
        ...data,
        reportedBy: getDemoUserName(),
        createdBy: getDemoUserName(),
        comments: [],
        relatedCopingSkills: [],
      },
    ])
    setShowAddTriggerModal(false)
  }

  const handleCancelAddTrigger = () => {
    setShowAddTriggerModal(false)
  }

  const handleAddPlan = () => {
    if (!newPlan.planType || !newPlan.description) return
    const newId = Math.max(...supplementalPlans.map((p) => p.id), 0) + 1
    setSupplementalPlans([...supplementalPlans, { id: newId, ...newPlan }])
    setNewPlan({
      startDate: "",
      planType: "",
      description: "",
      reEvaluationDate: "",
      endDate: "",
    })
    setShowAddPlan(false)
  }

  const handleSavePlanModal = () => {
    if (!planForm.planType || !planForm.startDate) return
    if (memberOptions && !(planForm as any).member) return

    // Academic Service Plan specific validation
    if (planForm.planType === "Academic Service Plan") {
      if (!planForm.asp_school || !planForm.asp_gradeAtStart) {
        return // School and Grade are required
      }
    }

    if (
      planForm.planType === STUDY_TIME_PLAN &&
      !isStudyTimePlanValid(planForm)
    )
      return

    const newId = Math.max(...supplementalPlans.map((p) => p.id), 0) + 1
    setSupplementalPlans([
      ...supplementalPlans,
      {
        id: newId,
        planType: planForm.planType,
        startDate: planForm.startDate,
        endDate: planForm.endDate,
        reEvaluationDate: planForm.reEvalDates.filter(Boolean)[0] || "",
        description: planForm.description,
        ...(memberOptions ? { member: (planForm as any).member || "" } : {}),
        ...studyTimePlanRecordFields(planForm),
      },
    ])
    resetAddPlanModal()
  }

  const handleAddTrauma = () => {
    // Required field validation
    if (
      !newTrauma.dateReported ||
      !newTrauma.subject ||
      !newTrauma.traumaType ||
      !newTrauma.ageOfFirstOccurrence ||
      !newTrauma.ongoing ||
      !newTrauma.description ||
      !newTrauma.dcfsHotlineRequired
    )
      return

    // Conditional validation: if Ongoing = Yes, then Age of Last Occurrence is required
    if (newTrauma.ongoing === "Yes" && !newTrauma.ageOfLastOccurrence) return

    const newId = Math.max(...traumaHistory.map((t) => t.id), 0) + 1
    setTraumaHistory([
      ...traumaHistory,
      {
        id: newId,
        ...newTrauma,
        createdBy: getDemoUserName(),
        comments: [],
      },
    ])
    setNewTrauma({
      dateReported: "",
      lastItpInclusion: "",
      subject: "",
      traumaType: "",
      ageOfFirstOccurrence: "",
      knownAgeFirst: "",
      ongoing: "",
      ageOfLastOccurrence: "",
      knownAgeLast: "",
      developmentStagesImpacted: [],
      impactOnYouth: [],
      reportedBy: [],
      dcfsHotlineRequired: "",
      comment: "",
      description: "",
      createdBy: "",
    })
    setShowAddTrauma(false)
  }

  // Trauma nested table handlers
  const handleAddDevStage = () => {
    if (!newDevStage) return
    const newStageObj = {
      id: Date.now(),
      stage: newDevStage,
    }
    setEditTraumaData({
      ...editTraumaData,
      developmentStagesImpacted: [
        ...editTraumaData.developmentStagesImpacted,
        newStageObj,
      ],
    })
    setNewDevStage("")
    setShowAddDevStage(false)
  }

  const handleDeleteDevStage = (id: number) => {
    setEditTraumaData({
      ...editTraumaData,
      developmentStagesImpacted:
        editTraumaData.developmentStagesImpacted.filter((s) => s.id !== id),
    })
  }

  const handleAddImpact = () => {
    if (!newImpact.date || !newImpact.description) return
    const newImpactObj = {
      id: Date.now(),
      date: newImpact.date,
      description: newImpact.description,
    }
    setEditTraumaData({
      ...editTraumaData,
      impactOnYouth: [...editTraumaData.impactOnYouth, newImpactObj],
    })
    setNewImpact({ date: "", description: "" })
    setShowAddImpact(false)
  }

  const handleDeleteImpact = (id: number) => {
    setEditTraumaData({
      ...editTraumaData,
      impactOnYouth: editTraumaData.impactOnYouth.filter((i) => i.id !== id),
    })
  }

  const handleAddReporter = () => {
    if (!newReporter.name || !newReporter.relationship) return
    const newReporterObj = {
      id: Date.now(),
      name: newReporter.name,
      relationship: newReporter.relationship,
    }
    setEditTraumaData({
      ...editTraumaData,
      reportedBy: [...editTraumaData.reportedBy, newReporterObj],
    })
    setNewReporter({ name: "", relationship: "" })
    setShowAddReporter(false)
  }

  const handleDeleteReporter = (id: number) => {
    setEditTraumaData({
      ...editTraumaData,
      reportedBy: editTraumaData.reportedBy.filter((r) => r.id !== id),
    })
  }

  const handleAddTraumaCommentToRecord = () => {
    if (!newTraumaCommentData.date || !newTraumaCommentData.comment) return
    const newCommentObj = {
      id: Date.now(),
      date: newTraumaCommentData.date,
      comment: newTraumaCommentData.comment,
      createdBy: getDemoUserName(),
      createdAt: new Date().toISOString(),
    }
    setEditTraumaData({
      ...editTraumaData,
      comments: [...editTraumaData.comments, newCommentObj],
    })
    setNewTraumaCommentData({ date: "", comment: "" })
    setShowAddTraumaComment(false)
  }

  const handleDeleteTraumaComment = (commentId: number) => {
    setEditTraumaData({
      ...editTraumaData,
      comments: editTraumaData.comments.filter((c: any) => c.id !== commentId),
    })
  }

  // Comment handlers
  const handleAddComment = (goalId: number) => {
    if (!newGoalComment.trim()) return

    setGoals(
      goals.map((g) => {
        if (g.id === goalId) {
          const comment = {
            id: Date.now(),
            text: newGoalComment,
            author: getDemoUserName(),
            date: formatMdy(new Date()),
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }
          return { ...g, comments: [...(g.comments || []), comment] }
        }
        return g
      }),
    )

    setNewGoalComment("")
    setShowCommentForm(null)
  }

  const toggleComments = (goal: any) => {
    setSelectedGoalForComments(goal)
    setCommentsModalOpen(true)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        {!supplementalOnly && (
          <div>
            <h2 className="text-[#080707]">Treatment Planning</h2>
            <p className="text-[13px] text-[#706e6b] mt-1">
              Manage treatment plans, goals, strengths, coping skills, triggers,
              supplemental plans, and trauma history
            </p>
          </div>
        )}

        {/* Main Card (Community Care "Plans": the section brings its own design-system Card) */}
        <div
          className={supplementalOnly ? "" : "overflow-hidden"}
          style={
            supplementalOnly
              ? undefined
              : {
                  border: "1px solid var(--slds-g-color-border-base-1)",
                  borderRadius: "var(--slds-c-card-radius-border)",
                  backgroundColor: "var(--slds-g-color-background-base)",
                }
          }
        >
          {/* Horizontal Sub-Tabs — scroll horizontally within the row on
                    narrow widths (app-scroll-strip: overflow-y hidden). The
                    divider is an inset shadow, not a border, so it takes no
                    height: the active 3px underline sits exactly on the row's
                    bottom edge and nothing overflows vertically. */}
          {!supplementalOnly && (
            <div
              data-leave-guard
              className="app-scroll-strip items-center gap-6 px-6"
              style={{
                boxShadow: "inset 0 -1px 0 0 var(--slds-g-color-border-base-1)",
                backgroundColor: "var(--slds-g-color-background-base)",
              }}
            >
              <button
                onClick={() => setActiveSubSection("ptp")}
                className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                  activeSubSection === "ptp"
                    ? "text-[#145F33]"
                    : "text-[#706e6b] hover:text-[#080707]"
                }`}
                style={
                  activeSubSection === "ptp"
                    ? {
                        borderBottom: "3px solid #145F33",
                      }
                    : {}
                }
              >
                PTP
              </button>
              <button
                onClick={() => setActiveSubSection("goals")}
                className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                  activeSubSection === "goals"
                    ? "text-[#145F33]"
                    : "text-[#706e6b] hover:text-[#080707]"
                }`}
                style={
                  activeSubSection === "goals"
                    ? {
                        borderBottom: "3px solid #145F33",
                      }
                    : {}
                }
              >
                Goals
              </button>
              <button
                onClick={() => setActiveSubSection("strengths")}
                className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                  activeSubSection === "strengths"
                    ? "text-[#145F33]"
                    : "text-[#706e6b] hover:text-[#080707]"
                }`}
                style={
                  activeSubSection === "strengths"
                    ? {
                        borderBottom: "3px solid #145F33",
                      }
                    : {}
                }
              >
                Strengths
              </button>
              <button
                onClick={() => setActiveSubSection("copingSkills")}
                className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                  activeSubSection === "copingSkills"
                    ? "text-[#145F33]"
                    : "text-[#706e6b] hover:text-[#080707]"
                }`}
                style={
                  activeSubSection === "copingSkills"
                    ? {
                        borderBottom: "3px solid #145F33",
                      }
                    : {}
                }
              >
                Coping Skills
              </button>
              <button
                onClick={() => setActiveSubSection("triggers")}
                className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                  activeSubSection === "triggers"
                    ? "text-[#145F33]"
                    : "text-[#706e6b] hover:text-[#080707]"
                }`}
                style={
                  activeSubSection === "triggers"
                    ? {
                        borderBottom: "3px solid #145F33",
                      }
                    : {}
                }
              >
                Triggers
              </button>
              {!hiddenTabs.includes("supplementalPlans") && (
                <button
                  onClick={() => setActiveSubSection("supplementalPlans")}
                  className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                    activeSubSection === "supplementalPlans"
                      ? "text-[#145F33]"
                      : "text-[#706e6b] hover:text-[#080707]"
                  }`}
                  style={
                    activeSubSection === "supplementalPlans"
                      ? { borderBottom: "3px solid #145F33" }
                      : {}
                  }
                >
                  Supplemental Plans
                </button>
              )}
              {!hiddenTabs.includes("traumaHistory") && (
                <button
                  onClick={() => setActiveSubSection("traumaHistory")}
                  className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                    activeSubSection === "traumaHistory"
                      ? "text-[#145F33]"
                      : "text-[#706e6b] hover:text-[#080707]"
                  }`}
                  style={
                    activeSubSection === "traumaHistory"
                      ? { borderBottom: "3px solid #145F33" }
                      : {}
                  }
                >
                  Trauma History
                </button>
              )}
              {transitionSummaryYouth !== undefined && (
                <button
                  data-leave-guard-ignore
                  onClick={() => setActiveSubSection("transitionSummary")}
                  className={`px-4 py-3 text-[13px] font-medium transition-colors relative whitespace-nowrap ${
                    activeSubSection === "transitionSummary"
                      ? "text-[#145F33]"
                      : "text-[#706e6b] hover:text-[#080707]"
                  }`}
                  style={
                    activeSubSection === "transitionSummary"
                      ? { borderBottom: "3px solid #145F33" }
                      : {}
                  }
                >
                  Transition Summary
                </button>
              )}
            </div>
          )}

          {/* Tab Content */}
          <div className={supplementalOnly ? "" : "p-6"}>
            {/* Transition Summary — keyed by youth so its selection
                        resets for another youth without touching other tabs. */}
            {activeSubSection === "transitionSummary" &&
              transitionSummaryYouth !== undefined && (
                <TransitionSummaryWorkspace
                  key={transitionSummaryYouth?.id ?? "unverified"}
                  youth={transitionSummaryYouth}
                  initialSummaryId={initialTransitionSummaryId}
                />
              )}
            {/* PTP Tab Content */}
            {activeSubSection === "ptp" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-[#080707]">
                    Positive Transition Plan
                  </h3>
                  <Button
                    type="button"
                    disabled={!!ptpUnavailableReason}
                    onClick={() => setShowAddPTPModal(true)}
                    className="h-8 px-3 rounded-full text-[13px]"
                    style={{
                      backgroundColor: "#145F33",
                      color: "white",
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add PTP Statement
                  </Button>
                </div>

                {/* Positive Transition Plan Table */}
                <div
                  className="rounded overflow-hidden"
                  style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                          }}
                        >
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Statement
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Outcome Domain(s)
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Start Date
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            End Date
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Goals Completed
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Status
                          </th>
                          <th
                            className="px-3 py-2 text-center font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Comment Count
                          </th>
                          <th
                            className="px-3 py-2 text-right font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(ptpUnavailableReason || ptpRows.length === 0) && (
                          <tr
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                            }}
                          >
                            <td
                              colSpan={8}
                              className="px-3 py-6 text-center text-[#706e6b]"
                              role={ptpUnavailableReason ? "alert" : undefined}
                            >
                              {ptpUnavailableReason ||
                                "No PTP statements have been added for this youth."}
                            </td>
                          </tr>
                        )}
                        {!ptpUnavailableReason &&
                          ptpRows.map((modality, index) => (
                            <tr
                              key={modality.id}
                              style={{
                                borderBottom:
                                  index < ptpRows.length - 1
                                    ? "1px solid var(--slds-g-color-border-base-1)"
                                    : "none",
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                              }}
                            >
                              <td className="px-3 py-3 text-[#080707]">
                                {modality.statement}
                              </td>
                              <td className="px-3 py-3 text-[#080707]">
                                {Array.isArray(modality.outcomeDomains)
                                  ? modality.outcomeDomains.join(", ")
                                  : modality.outcomeDomains}
                              </td>
                              <td className="px-3 py-3 text-[#080707]">
                                {modality.startDate}
                              </td>
                              <td className="px-3 py-3 text-[#080707]">
                                {modality.endDate || "—"}
                              </td>
                              <td className="px-3 py-3 text-[#080707]">
                                {modality.goalsCompleted || "—"}
                              </td>
                              <td className="px-3 py-3">
                                <Badge
                                  className={`rounded-sm ${
                                    modality.status === "Completed"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : modality.status === "In Progress"
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : modality.status === "Paused"
                                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                          : modality.status === "Cancelled"
                                            ? "bg-red-50 text-red-700 border-red-200"
                                            : "bg-gray-50 text-gray-700 border-gray-200"
                                  }`}
                                >
                                  {modality.status}
                                </Badge>
                              </td>
                              <td className="px-3 py-3 text-center text-[#080707]">
                                {modality.comments?.length || 0}
                              </td>
                              <td className="px-3 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    className="text-[#706e6b] hover:text-[#3e3e3c] p-1"
                                    onClick={() => handleEditModality(modality)}
                                    title="Edit"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    className="text-[#c23934] hover:text-[#8a2a27] p-1"
                                    onClick={() =>
                                      handleDeleteModality(modality.id)
                                    }
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add/Edit PTP Statement Modal */}
                <Dialog
                  open={showAddPTPModal || showEditPTPModal}
                  onOpenChange={(open) => {
                    if (!open) {
                      handleCancelEditModality()
                    }
                  }}
                >
                  <DialogContent
                    className="max-w-3xl max-h-[90vh] overflow-y-auto"
                    aria-describedby={undefined}
                  >
                    <DialogHeader>
                      <DialogTitle className="text-[16px] font-semibold text-[#080707]">
                        {editingModalityId !== null
                          ? "Edit PTP Statement"
                          : "Add PTP Statement"}
                      </DialogTitle>
                      <DialogDescription className="text-[13px] text-[#706e6b]">
                        {editingModalityId !== null
                          ? "Update the PTP statement details and track progress."
                          : "Create a new Positive Transition Plan statement for the youth."}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      {/* Statement */}
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">
                          Statement <span className="text-red-600">*</span>
                        </Label>
                        <Textarea
                          value={newModality.statement}
                          onChange={(e) =>
                            setNewModality({
                              ...newModality,
                              statement: e.target.value,
                            })
                          }
                          className="min-h-[80px] text-[13px] rounded resize-none"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            borderColor: "var(--slds-g-color-border-base-1)",
                          }}
                          placeholder="Enter transition statement"
                        />
                      </div>

                      {/* Outcome Domain(s) - Multi-Select */}
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">
                          Outcome Domain(s){" "}
                          <span className="text-red-600">*</span>
                        </Label>
                        <div
                          className="p-3 rounded space-y-2"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-base)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                              "Daily Living Skills",
                              "Self-Care Skills",
                              "Relationships and Communication",
                              "Housing, Money Management & Transportation",
                              "Work and Study Life",
                              "Career and Education Planning",
                              "Civic Engagement",
                              "Navigating the Child Welfare System",
                              "Looking Forward",
                              "Education & Vocation",
                              "Other",
                            ].map((domain) => (
                              <label
                                key={domain}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={
                                    newModality.outcomeDomains?.includes(
                                      domain,
                                    ) || false
                                  }
                                  onChange={() => toggleOutcomeDomain(domain)}
                                  className="w-4 h-4 rounded"
                                  style={{
                                    accentColor: "#145F33",
                                  }}
                                />
                                <span className="text-[13px] text-[#080707]">
                                  {domain}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Other Outcome Domain - Conditional */}
                      {newModality.outcomeDomains?.includes("Other") && (
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">
                            Other Outcome Domain{" "}
                            <span className="text-red-600">*</span>
                          </Label>
                          <Input
                            value={newModality.otherOutcomeDomain}
                            onChange={(e) =>
                              setNewModality({
                                ...newModality,
                                otherOutcomeDomain: e.target.value,
                              })
                            }
                            className="h-9 text-[13px] rounded"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              borderColor: "var(--slds-g-color-border-base-1)",
                            }}
                            placeholder="Specify other outcome domain"
                          />
                        </div>
                      )}

                      {/* Dates Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">
                            Start Date <span className="text-red-600">*</span>
                          </Label>
                          <Input
                            type="text"
                            value={newModality.startDate}
                            onChange={(e) =>
                              setNewModality({
                                ...newModality,
                                startDate: e.target.value,
                              })
                            }
                            placeholder="MM/DD/YYYY"
                            className="h-9 text-[13px] rounded"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              borderColor: "var(--slds-g-color-border-base-1)",
                            }}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">
                            End Date
                          </Label>
                          <Input
                            type="text"
                            value={newModality.endDate}
                            onChange={(e) =>
                              setNewModality({
                                ...newModality,
                                endDate: e.target.value,
                              })
                            }
                            placeholder="MM/DD/YYYY"
                            className="h-9 text-[13px] rounded"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              borderColor: "var(--slds-g-color-border-base-1)",
                            }}
                          />
                        </div>
                      </div>

                      {/* Goals Completed and Status Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">
                            Goals Completed (System Calculated)
                          </Label>
                          <Input
                            value={newModality.goalsCompleted || "—"}
                            disabled
                            className="h-9 text-[13px] rounded"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-alt)",
                              borderColor: "var(--slds-g-color-border-base-1)",
                              color: "#706e6b",
                              cursor: "not-allowed",
                            }}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-semibold uppercase tracking-wide text-[#706e6b]">
                            Status
                          </Label>
                          <select
                            value={newModality.status}
                            onChange={(e) =>
                              setNewModality({
                                ...newModality,
                                status: e.target.value,
                              })
                            }
                            className="h-9 text-[13px] rounded w-full px-2.5"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              borderColor: "var(--slds-g-color-border-base-1)",
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <option value="New">New</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Paused">Paused</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      {/* Comments Section */}
                      <div
                        className="space-y-3 pt-4"
                        style={{
                          borderTop:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <Label className="text-[13px] font-semibold text-[#080707]">
                            Comments
                          </Label>
                          <span className="text-[11px] text-[#706e6b]">
                            {newModality.comments?.length || 0} comment
                            {(newModality.comments?.length || 0) !== 1
                              ? "s"
                              : ""}
                          </span>
                        </div>

                        {/* Add/Edit Comment Form */}
                        <div
                          className="p-3 rounded space-y-3"
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                              <Label className="text-[11px] font-medium text-[#080707]">
                                Date <span className="text-red-600">*</span>
                              </Label>
                              <Input
                                type="text"
                                value={newComment.date}
                                onChange={(e) =>
                                  setNewComment({
                                    ...newComment,
                                    date: e.target.value,
                                  })
                                }
                                placeholder="MM/DD/YYYY"
                                className="h-8 text-[13px] rounded"
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-base)",
                                  borderColor:
                                    "var(--slds-g-color-border-base-1)",
                                }}
                              />
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                              <Label className="text-[11px] font-medium text-[#080707]">
                                Comment <span className="text-red-600">*</span>
                              </Label>
                              <Input
                                value={newComment.comment}
                                onChange={(e) =>
                                  setNewComment({
                                    ...newComment,
                                    comment: e.target.value,
                                  })
                                }
                                className="h-8 text-[13px] rounded"
                                style={{
                                  backgroundColor:
                                    "var(--slds-g-color-background-base)",
                                  borderColor:
                                    "var(--slds-g-color-border-base-1)",
                                }}
                                placeholder="Enter comment"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            {editingCommentId !== null && (
                              <Button
                                type="button"
                                onClick={handleCancelPTPCommentEdit}
                                className="h-7 px-3 rounded-full text-[12px]"
                                style={{
                                  backgroundColor: "transparent",
                                  color: "#706e6b",
                                  border:
                                    "1px solid var(--slds-g-color-border-base-1)",
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                            <Button
                              type="button"
                              onClick={handleAddPTPComment}
                              className="h-7 px-3 rounded-full text-[12px]"
                              style={{
                                backgroundColor: "#145F33",
                                color: "white",
                              }}
                            >
                              {editingCommentId !== null
                                ? "Update Comment"
                                : "Add Comment"}
                            </Button>
                          </div>
                        </div>

                        {/* Comments List */}
                        {newModality.comments &&
                          newModality.comments.length > 0 && (
                            <div className="space-y-2">
                              {newModality.comments
                                .sort(
                                  (a, b) =>
                                    new Date(a.date).getTime() -
                                    new Date(b.date).getTime(),
                                )
                                .map((comment) => (
                                  <div
                                    key={comment.id}
                                    className="p-3 rounded"
                                    style={{
                                      backgroundColor:
                                        "var(--slds-g-color-background-base)",
                                      border:
                                        "1px solid var(--slds-g-color-border-base-1)",
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <div className="text-[11px] text-[#706e6b] mb-1">
                                          {comment.date}
                                        </div>
                                        <div className="text-[13px] text-[#080707]">
                                          {comment.comment}
                                        </div>
                                      </div>
                                      <div className="flex gap-1">
                                        <button
                                          type="button"
                                          className="text-[#706e6b] hover:text-[#3e3e3c] p-1"
                                          onClick={() =>
                                            handleEditPTPComment(comment)
                                          }
                                          title="Edit Comment"
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </button>
                                        <button
                                          type="button"
                                          className="text-[#c23934] hover:text-[#8a2a27] p-1"
                                          onClick={() =>
                                            handleDeletePTPComment(comment.id)
                                          }
                                          title="Delete Comment"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}

                        {newModality.comments &&
                          newModality.comments.length === 0 && (
                            <div
                              className="p-4 text-center text-[13px] text-[#706e6b] rounded"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-alt)",
                                border:
                                  "1px dashed var(--slds-g-color-border-base-1)",
                              }}
                            >
                              No comments yet. Add a comment above.
                            </div>
                          )}
                      </div>
                    </div>

                    <DialogFooter>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          onClick={handleCancelEditModality}
                          className="h-8 px-4 rounded-full text-[13px]"
                          style={{
                            backgroundColor: "transparent",
                            color: "#706e6b",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={handleAddModality}
                          className="h-8 px-4 rounded-full text-[13px]"
                          style={{
                            backgroundColor: "#145F33",
                            color: "white",
                          }}
                        >
                          {editingModalityId !== null
                            ? "Update Statement"
                            : "Save Statement"}
                        </Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Goals Tab Content - Simplified Care Plan Template */}
            <TreatmentPlanningGoalsSection
              activeSubSection={activeSubSection}
              calculateOverallProgress={calculateOverallProgress}
              editGoalData={editGoalData}
              editGoalType={editGoalType}
              editingGoalId={editingGoalId}
              expandedGoals={expandedGoals}
              goals={goals}
              handleAddGoal={handleAddGoal}
              handleCancelEditGoal={handleCancelEditGoal}
              handleDeleteGoal={handleDeleteGoal}
              handleEditGoal={handleEditGoal}
              handleSaveGoal={handleSaveGoal}
              newGoal={newGoal}
              setEditGoalData={setEditGoalData}
              setExpandedGoals={setExpandedGoals}
              setNewGoal={setNewGoal}
              setShowAddGoal={setShowAddGoal}
              setShowAddGoalModal={setShowAddGoalModal}
              setShowEditGoalModal={setShowEditGoalModal}
              showAddGoal={showAddGoal}
              showAddGoalModal={showAddGoalModal}
              showEditGoalModal={showEditGoalModal}
              startDate={startDate}
              targetEnd={targetEnd}
              toggleComments={toggleComments}
              toggleGoalExpansion={toggleGoalExpansion}
              updateGoalProgress={updateGoalProgress}
            />
            {activeSubSection === "strengths" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-[#080707]">
                    Client Strengths
                  </h3>
                  <Button
                    onClick={() => setShowAddStrengthModal(true)}
                    className="h-8 px-3 rounded-full text-[13px]"
                    style={{
                      backgroundColor: "#145F33",
                      color: "white",
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Strength
                  </Button>
                </div>

                {/* Add Strength Modal */}
                <StrengthModal
                  isOpen={showAddStrengthModal}
                  onClose={handleCancelAddStrength}
                  onSave={handleAddStrength}
                />

                {/* Strengths Table */}
                <div
                  className="rounded overflow-hidden"
                  style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                          }}
                        >
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Date Reported
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Last ITP Inclusion
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Subject
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Strength
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Description
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Reported By
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Created By
                          </th>
                          <th
                            className="px-3 py-2 text-center font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Comment Count
                          </th>
                          <th
                            className="px-3 py-2 text-right font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {strengths.map((strength, index) => (
                          <tr
                            key={strength.id}
                            style={{
                              borderBottom:
                                index < strengths.length - 1
                                  ? "1px solid var(--slds-g-color-border-base-1)"
                                  : "none",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                            }}
                          >
                            <td className="px-3 py-3 text-[#080707]">
                              {strength.dateReported}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {strength.lastITPInclusion}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {strength.subject}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {strength.strength}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {strength.description}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {strength.reportedBy}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {strength.createdBy}
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span
                                className="inline-flex items-center justify-center min-w-[24px] h-[24px] rounded-full text-[11px] font-semibold"
                                style={{
                                  backgroundColor:
                                    (strength.comments?.length || 0) > 0
                                      ? "#e8f4f0"
                                      : "#f3f2f2",
                                  color:
                                    (strength.comments?.length || 0) > 0
                                      ? "#145F33"
                                      : "#706e6b",
                                }}
                              >
                                {strength.comments?.length || 0}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  className="text-[#706e6b] hover:text-[#3e3e3c] p-1"
                                  onClick={() => handleEditStrength(strength)}
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  className="text-[#c23934] hover:text-[#8a2a27] p-1"
                                  onClick={() =>
                                    handleDeleteStrength(strength.id)
                                  }
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Edit Strength Modal */}
                {showEditStrengthModal && (
                  <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                    onClick={handleCancelEditStrength}
                  >
                    <div
                      className="rounded-lg max-w-4xl w-full mx-4"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid var(--slds-g-color-border-base-1)",
                        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                        maxHeight: "90vh",
                        overflow: "auto",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Modal Header */}
                      <div
                        className="px-6 py-4 flex items-start justify-between sticky top-0 bg-white z-10"
                        style={{
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <h2 className="text-[16px] font-semibold text-[#080707]">
                          Edit Strength
                        </h2>
                        <button
                          onClick={handleCancelEditStrength}
                          className="text-[#706e6b] hover:text-[#080707]"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="px-6 py-4 space-y-4">
                        {/* Strength Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">
                              Date Reported{" "}
                              <span className="text-red-600">*</span>
                            </Label>
                            <DateInput
                              value={isoToMdy(editStrengthData.dateReported)}
                              onChange={(v) =>
                                ((e) =>
                                  setEditStrengthData({
                                    ...editStrengthData,
                                    dateReported: e.target.value,
                                  }))({ target: { value: mdyToIso(v) } })
                              }
                              className="h-9 text-[13px] rounded"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">
                              Last ITP Inclusion
                            </Label>
                            <DateInput
                              value={isoToMdy(
                                editStrengthData.lastITPInclusion,
                              )}
                              onChange={(v) =>
                                ((e) =>
                                  setEditStrengthData({
                                    ...editStrengthData,
                                    lastITPInclusion: e.target.value,
                                  }))({ target: { value: mdyToIso(v) } })
                              }
                              className="h-9 text-[13px] rounded"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">
                              Subject <span className="text-red-600">*</span>
                            </Label>
                            <Input
                              value={editStrengthData.subject}
                              onChange={(e) =>
                                setEditStrengthData({
                                  ...editStrengthData,
                                  subject: e.target.value,
                                })
                              }
                              className="h-9 text-[13px] rounded"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                              }}
                              placeholder="e.g., Emotional Wellness"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">
                              Strength <span className="text-red-600">*</span>
                            </Label>
                            <Input
                              value={editStrengthData.strength}
                              onChange={(e) =>
                                setEditStrengthData({
                                  ...editStrengthData,
                                  strength: e.target.value,
                                })
                              }
                              className="h-9 text-[13px] rounded"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                              }}
                              placeholder="Enter strength"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-semibold text-[#080707]">
                            Description
                          </Label>
                          <Textarea
                            value={editStrengthData.description}
                            onChange={(e) =>
                              setEditStrengthData({
                                ...editStrengthData,
                                description: e.target.value,
                              })
                            }
                            className="text-[13px] rounded min-h-[80px] resize-none"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              borderColor: "var(--slds-g-color-border-base-1)",
                            }}
                            placeholder="Enter detailed description"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">
                              Reported By
                            </Label>
                            <Input
                              value={editStrengthData.reportedBy}
                              readOnly
                              disabled
                              className="h-9 text-[13px] rounded"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-alt)",
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                                cursor: "not-allowed",
                                opacity: 0.6,
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">
                              Created By
                            </Label>
                            <Input
                              value={editStrengthData.createdBy}
                              readOnly
                              disabled
                              className="h-9 text-[13px] rounded"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-alt)",
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                                cursor: "not-allowed",
                                opacity: 0.6,
                              }}
                            />
                          </div>
                        </div>

                        {/* Comments Section */}
                        <div
                          className="pt-4 mt-4"
                          style={{
                            borderTop:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[13px] font-semibold text-[#080707]">
                              Comments ({editStrengthData.comments?.length || 0}
                              )
                            </h3>
                          </div>

                          {/* Add Comment Form */}
                          <div
                            className="space-y-3 p-3 rounded mb-3"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-alt)",
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[#080707]">
                                  Date <span className="text-red-600">*</span>
                                </Label>
                                <DateInput
                                  value={isoToMdy(newStrengthComment.date)}
                                  onChange={(v) =>
                                    ((e) =>
                                      setNewStrengthComment({
                                        ...newStrengthComment,
                                        date: e.target.value,
                                      }))({ target: { value: mdyToIso(v) } })
                                  }
                                  className="h-9 text-[13px] rounded"
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-base)",
                                    borderColor:
                                      "var(--slds-g-color-border-base-1)",
                                  }}
                                />
                              </div>
                              <div className="space-y-1.5 md:col-span-3">
                                <Label className="text-[11px] font-semibold text-[#080707]">
                                  Comment{" "}
                                  <span className="text-red-600">*</span>
                                </Label>
                                <Textarea
                                  value={newStrengthComment.comment}
                                  onChange={(e) =>
                                    setNewStrengthComment({
                                      ...newStrengthComment,
                                      comment: e.target.value,
                                    })
                                  }
                                  className="text-[13px] rounded min-h-[60px] resize-none"
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-base)",
                                    borderColor:
                                      "var(--slds-g-color-border-base-1)",
                                  }}
                                  placeholder="Enter comment text"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                onClick={handleAddStrengthComment}
                                className="h-8 px-4 rounded-full text-[12px]"
                                style={{
                                  backgroundColor: "#145F33",
                                  color: "white",
                                }}
                                disabled={
                                  !newStrengthComment.date ||
                                  !newStrengthComment.comment
                                }
                              >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Add Comment
                              </Button>
                            </div>
                          </div>

                          {/* Comments List */}
                          <div className="space-y-2">
                            {editStrengthData.comments &&
                            editStrengthData.comments.length > 0 ? (
                              editStrengthData.comments
                                .sort(
                                  (a: any, b: any) =>
                                    new Date(a.createdAt).getTime() -
                                    new Date(b.createdAt).getTime(),
                                )
                                .map((comment: any) => (
                                  <div
                                    key={comment.id}
                                    className="p-3 rounded"
                                    style={{
                                      backgroundColor:
                                        "var(--slds-g-color-background-base)",
                                      border:
                                        "1px solid var(--slds-g-color-border-base-1)",
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-[11px] font-semibold text-[#080707]">
                                            {comment.date}
                                          </span>
                                          <span className="text-[10px] text-[#706e6b]">
                                            by {comment.createdBy}
                                          </span>
                                        </div>
                                        <p className="text-[12px] text-[#080707]">
                                          {comment.comment}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleDeleteStrengthComment(
                                            comment.id,
                                          )
                                        }
                                        className="text-[#c23934] hover:text-[#8a2a27] p-1"
                                        title="Delete Comment"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                            ) : (
                              <div className="text-center py-6 text-[11px] text-[#706e6b] italic">
                                No comments yet. Add a comment above to get
                                started.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div
                        className="px-6 py-4 flex justify-end gap-2 sticky bottom-0 bg-white"
                        style={{
                          borderTop:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <Button
                          onClick={handleCancelEditStrength}
                          className="h-9 px-4 rounded-full text-[13px] font-medium"
                          style={{
                            backgroundColor: "transparent",
                            color: "#706e6b",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpdateStrength}
                          className="h-9 px-4 rounded-full text-[13px] font-medium"
                          style={{
                            backgroundColor: "#145F33",
                            color: "white",
                          }}
                          disabled={
                            !editStrengthData.dateReported ||
                            !editStrengthData.subject ||
                            !editStrengthData.strength
                          }
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Coping Skills Tab Content */}
            {activeSubSection === "copingSkills" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-[#080707]">
                    Coping Skills
                  </h3>
                  <Button
                    onClick={() => setShowAddCopingSkillModal(true)}
                    className="h-8 px-3 rounded-full text-[13px]"
                    style={{
                      backgroundColor: "#145F33",
                      color: "white",
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Coping Skill
                  </Button>
                </div>

                {/* Add Coping Skill Modal */}
                <CopingSkillModal
                  isOpen={showAddCopingSkillModal}
                  onClose={handleCancelAddCopingSkill}
                  onSave={handleAddCopingSkill}
                />

                {/* Coping Skills Table */}
                <div
                  className="rounded overflow-hidden"
                  style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                          }}
                        >
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Date Reported
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Last ITP Inclusion
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Coping Skill
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Description
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Effective When
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Reported By
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Created By
                          </th>
                          <th
                            className="px-3 py-2 text-right font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {copingSkills.map((skill, index) => (
                          <tr
                            key={skill.id}
                            style={{
                              borderBottom:
                                index < copingSkills.length - 1
                                  ? "1px solid var(--slds-g-color-border-base-1)"
                                  : "none",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                            }}
                          >
                            <td className="px-3 py-3 text-[#080707]">
                              {skill.dateReported}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {skill.lastITPInclusion}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {skill.copingSkill}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {skill.description}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {skill.effectiveWhen}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {skill.reportedBy}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {skill.createdBy}
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  className="text-[#706e6b] hover:text-[#3e3e3c] p-1"
                                  onClick={() => handleEditCopingSkill(skill)}
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  className="text-[#c23934] hover:text-[#8a2a27] p-1"
                                  onClick={() =>
                                    handleDeleteCopingSkill(skill.id)
                                  }
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Triggers Tab Content */}
            {activeSubSection === "triggers" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-[#080707]">
                    Identified Triggers
                  </h3>
                  <Button
                    onClick={() => setShowAddTriggerModal(true)}
                    className="h-8 px-3 rounded-full text-[13px]"
                    style={{
                      backgroundColor: "#145F33",
                      color: "white",
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Trigger
                  </Button>
                </div>

                {/* Add Trigger Modal */}
                <TriggerModal
                  isOpen={showAddTriggerModal}
                  onClose={handleCancelAddTrigger}
                  onSave={handleAddTrigger}
                />

                {/* Triggers Table */}
                <div
                  className="rounded overflow-hidden"
                  style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr
                          style={{
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                          }}
                        >
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Date Reported
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Last ITP Inclusion
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Trigger
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Description
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Related Coping Skills
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            End Date
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Reported By
                          </th>
                          <th
                            className="px-3 py-2 text-left font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Created By
                          </th>
                          <th
                            className="px-3 py-2 text-center font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Comment Count
                          </th>
                          <th
                            className="px-3 py-2 text-right font-semibold text-[#080707]"
                            style={{
                              borderBottom:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {triggers.map((trigger, index) => (
                          <tr
                            key={trigger.id}
                            style={{
                              borderBottom:
                                index < triggers.length - 1
                                  ? "1px solid var(--slds-g-color-border-base-1)"
                                  : "none",
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                            }}
                          >
                            <td className="px-3 py-3 text-[#080707]">
                              {trigger.dateReported}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {trigger.lastITPInclusion}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {trigger.trigger}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {trigger.description}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {Array.isArray(trigger.relatedCopingSkills)
                                ? trigger.relatedCopingSkills.join(", ")
                                : trigger.relatedCopingSkills}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {trigger.endDate || "—"}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {trigger.reportedBy}
                            </td>
                            <td className="px-3 py-3 text-[#080707]">
                              {trigger.createdBy}
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span
                                className="inline-flex items-center justify-center min-w-[24px] h-[24px] rounded-full text-[11px] font-semibold"
                                style={{
                                  backgroundColor:
                                    (trigger.comments?.length || 0) > 0
                                      ? "#e8f4f0"
                                      : "#f3f2f2",
                                  color:
                                    (trigger.comments?.length || 0) > 0
                                      ? "#145F33"
                                      : "#706e6b",
                                }}
                              >
                                {trigger.comments?.length || 0}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  className="text-[#706e6b] hover:text-[#3e3e3c] p-1"
                                  onClick={() => handleEditTrigger(trigger)}
                                  title="Edit"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  className="text-[#c23934] hover:text-[#8a2a27] p-1"
                                  onClick={() =>
                                    handleDeleteTrigger(trigger.id)
                                  }
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Edit Trigger Modal */}
                {showEditTriggerModal && (
                  <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                    onClick={handleCancelEditTrigger}
                  >
                    <div
                      className="rounded-lg max-w-4xl w-full mx-4"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid var(--slds-g-color-border-base-1)",
                        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                        maxHeight: "90vh",
                        overflow: "auto",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Modal Header */}
                      <div
                        className="px-6 py-4 flex items-start justify-between sticky top-0 bg-white z-10"
                        style={{
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <h2 className="text-[16px] font-semibold text-[#080707]">
                          Edit Trigger
                        </h2>
                        <button
                          onClick={handleCancelEditTrigger}
                          className="text-[#706e6b] hover:text-[#080707]"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="px-6 py-4 space-y-4">
                        {/* Trigger Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">
                              Date Reported{" "}
                              <span className="text-red-600">*</span>
                            </Label>
                            <DateInput
                              value={isoToMdy(editTriggerData.dateReported)}
                              onChange={(v) =>
                                ((e) =>
                                  setEditTriggerData({
                                    ...editTriggerData,
                                    dateReported: e.target.value,
                                  }))({ target: { value: mdyToIso(v) } })
                              }
                              className="h-9 text-[13px] rounded"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">
                              Last ITP Inclusion
                            </Label>
                            <DateInput
                              value={isoToMdy(editTriggerData.lastITPInclusion)}
                              onChange={(v) =>
                                ((e) =>
                                  setEditTriggerData({
                                    ...editTriggerData,
                                    lastITPInclusion: e.target.value,
                                  }))({ target: { value: mdyToIso(v) } })
                              }
                              className="h-9 text-[13px] rounded"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">
                              Trigger <span className="text-red-600">*</span>
                            </Label>
                            <Input
                              value={editTriggerData.trigger}
                              onChange={(e) =>
                                setEditTriggerData({
                                  ...editTriggerData,
                                  trigger: e.target.value,
                                })
                              }
                              className="h-9 text-[13px] rounded"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                              }}
                              placeholder="Enter trigger"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">
                              End Date
                            </Label>
                            <DateInput
                              value={isoToMdy(editTriggerData.endDate)}
                              onChange={(v) =>
                                ((e) =>
                                  setEditTriggerData({
                                    ...editTriggerData,
                                    endDate: e.target.value,
                                  }))({ target: { value: mdyToIso(v) } })
                              }
                              className="h-9 text-[13px] rounded"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-base)",
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-semibold text-[#080707]">
                            Description
                          </Label>
                          <Textarea
                            value={editTriggerData.description}
                            onChange={(e) =>
                              setEditTriggerData({
                                ...editTriggerData,
                                description: e.target.value,
                              })
                            }
                            className="text-[13px] rounded min-h-[80px] resize-none"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-base)",
                              borderColor: "var(--slds-g-color-border-base-1)",
                            }}
                            placeholder="Enter detailed description"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-semibold text-[#080707]">
                            Related Coping Skills
                          </Label>
                          <div
                            className="space-y-2 max-h-40 overflow-y-auto p-3 rounded"
                            style={{
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            {copingSkills.map((skill) => (
                              <label
                                key={skill.id}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={editTriggerData.relatedCopingSkills.includes(
                                    skill.copingSkill,
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditTriggerData({
                                        ...editTriggerData,
                                        relatedCopingSkills: [
                                          ...editTriggerData.relatedCopingSkills,
                                          skill.copingSkill,
                                        ],
                                      })
                                    } else {
                                      setEditTriggerData({
                                        ...editTriggerData,
                                        relatedCopingSkills:
                                          editTriggerData.relatedCopingSkills.filter(
                                            (s) => s !== skill.copingSkill,
                                          ),
                                      })
                                    }
                                  }}
                                  className="h-4 w-4 rounded"
                                  style={{ accentColor: "#145F33" }}
                                />
                                <span className="text-[13px] text-[#080707]">
                                  {skill.copingSkill}
                                </span>
                              </label>
                            ))}
                            {copingSkills.length === 0 && (
                              <p className="text-[11px] text-[#706e6b] italic">
                                No coping skills available. Add coping skills
                                first.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">
                              Reported By
                            </Label>
                            <Input
                              value={editTriggerData.reportedBy}
                              readOnly
                              disabled
                              className="h-9 text-[13px] rounded"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-alt)",
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                                cursor: "not-allowed",
                                opacity: 0.6,
                              }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">
                              Created By
                            </Label>
                            <Input
                              value={editTriggerData.createdBy}
                              readOnly
                              disabled
                              className="h-9 text-[13px] rounded"
                              style={{
                                backgroundColor:
                                  "var(--slds-g-color-background-alt)",
                                borderColor:
                                  "var(--slds-g-color-border-base-1)",
                                cursor: "not-allowed",
                                opacity: 0.6,
                              }}
                            />
                          </div>
                        </div>

                        {/* Comments Section */}
                        <div
                          className="pt-4 mt-4"
                          style={{
                            borderTop:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[13px] font-semibold text-[#080707]">
                              Comments ({editTriggerData.comments?.length || 0})
                            </h3>
                          </div>

                          {/* Add Comment Form */}
                          <div
                            className="space-y-3 p-3 rounded mb-3"
                            style={{
                              backgroundColor:
                                "var(--slds-g-color-background-alt)",
                              border:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[#080707]">
                                  Date <span className="text-red-600">*</span>
                                </Label>
                                <DateInput
                                  value={isoToMdy(newTriggerComment.date)}
                                  onChange={(v) =>
                                    ((e) =>
                                      setNewTriggerComment({
                                        ...newTriggerComment,
                                        date: e.target.value,
                                      }))({ target: { value: mdyToIso(v) } })
                                  }
                                  className="h-9 text-[13px] rounded"
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-base)",
                                    borderColor:
                                      "var(--slds-g-color-border-base-1)",
                                  }}
                                />
                              </div>
                              <div className="space-y-1.5 md:col-span-3">
                                <Label className="text-[11px] font-semibold text-[#080707]">
                                  Comment{" "}
                                  <span className="text-red-600">*</span>
                                </Label>
                                <Textarea
                                  value={newTriggerComment.comment}
                                  onChange={(e) =>
                                    setNewTriggerComment({
                                      ...newTriggerComment,
                                      comment: e.target.value,
                                    })
                                  }
                                  className="text-[13px] rounded min-h-[60px] resize-none"
                                  style={{
                                    backgroundColor:
                                      "var(--slds-g-color-background-base)",
                                    borderColor:
                                      "var(--slds-g-color-border-base-1)",
                                  }}
                                  placeholder="Enter comment text"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                onClick={handleAddTriggerComment}
                                className="h-8 px-4 rounded-full text-[12px]"
                                style={{
                                  backgroundColor: "#145F33",
                                  color: "white",
                                }}
                                disabled={
                                  !newTriggerComment.date ||
                                  !newTriggerComment.comment
                                }
                              >
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Add Comment
                              </Button>
                            </div>
                          </div>

                          {/* Comments List */}
                          <div className="space-y-2">
                            {editTriggerData.comments &&
                            editTriggerData.comments.length > 0 ? (
                              editTriggerData.comments
                                .sort(
                                  (a: any, b: any) =>
                                    new Date(a.createdAt).getTime() -
                                    new Date(b.createdAt).getTime(),
                                )
                                .map((comment: any) => (
                                  <div
                                    key={comment.id}
                                    className="p-3 rounded"
                                    style={{
                                      backgroundColor:
                                        "var(--slds-g-color-background-base)",
                                      border:
                                        "1px solid var(--slds-g-color-border-base-1)",
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-[11px] font-semibold text-[#080707]">
                                            {comment.date}
                                          </span>
                                          <span className="text-[10px] text-[#706e6b]">
                                            by {comment.createdBy}
                                          </span>
                                        </div>
                                        <p className="text-[12px] text-[#080707]">
                                          {comment.comment}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleDeleteTriggerComment(comment.id)
                                        }
                                        className="text-[#c23934] hover:text-[#8a2a27] p-1"
                                        title="Delete Comment"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                            ) : (
                              <div className="text-center py-6 text-[11px] text-[#706e6b] italic">
                                No comments yet. Add a comment above to get
                                started.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Modal Footer */}
                      <div
                        className="px-6 py-4 flex justify-end gap-2 sticky bottom-0 bg-white"
                        style={{
                          borderTop:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <Button
                          onClick={handleCancelEditTrigger}
                          className="h-9 px-4 rounded-full text-[13px] font-medium"
                          style={{
                            backgroundColor: "transparent",
                            color: "#706e6b",
                            border:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpdateTrigger}
                          className="h-9 px-4 rounded-full text-[13px] font-medium"
                          style={{
                            backgroundColor: "#145F33",
                            color: "white",
                          }}
                          disabled={
                            !editTriggerData.dateReported ||
                            !editTriggerData.trigger
                          }
                        >
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Supplemental Plans Tab Content */}
            <TreatmentPlanningSupplementalSection
              AGREEMENT_TYPES={AGREEMENT_TYPES}
              ASP_SERVICES={ASP_SERVICES}
              CLP_DOMAINS={CLP_DOMAINS}
              PLANS_WITH_SIGNATURES={PLANS_WITH_SIGNATURES}
              PLAN_TYPES={
                supplementalOnly
                  ? ["Scholarship Agreement", "Community Launch Plan"]
                  : PLAN_TYPES
              }
              SA_CATEGORIES={SA_CATEGORIES}
              activeSubSection={activeSubSection}
              addPlanTab={addPlanTab}
              editingPlanId={editingPlanId}
              handleDeletePlan={handleDeletePlan}
              handleSavePlanModal={handleSavePlanModal}
              isAddPlanModalOpen={isAddPlanModalOpen}
              planForm={planForm}
              resetAddPlanModal={resetAddPlanModal}
              setAddPlanTab={setAddPlanTab}
              setEditingPlanId={setEditingPlanId}
              setIsAddPlanModalOpen={setIsAddPlanModalOpen}
              setPlanForm={setPlanForm}
              setSupplementalPlans={setSupplementalPlans}
              supplementalPlans={supplementalPlans}
              hiddenTabs={hiddenTabs}
              testingAssessments={testingAssessments}
              plainPlansLabel={supplementalOnly}
              showMemberColumn={showMemberColumn}
              memberOptions={memberOptions}
            />
            <TreatmentPlanningTraumaSection
              activeSubSection={activeSubSection}
              commentsModalOpen={commentsModalOpen}
              editCopingSkillData={editCopingSkillData}
              editTraumaData={editTraumaData}
              editingCopingSkillCommentId={editingCopingSkillCommentId}
              editingTraumaId={editingTraumaId}
              expandedTraumaId={expandedTraumaId}
              handleAddCopingSkillComment={handleAddCopingSkillComment}
              handleAddDevStage={handleAddDevStage}
              handleAddImpact={handleAddImpact}
              handleAddReporter={handleAddReporter}
              handleAddTrauma={handleAddTrauma}
              handleAddTraumaCommentToRecord={handleAddTraumaCommentToRecord}
              handleCancelEditCopingSkill={handleCancelEditCopingSkill}
              handleCancelEditCopingSkillComment={
                handleCancelEditCopingSkillComment
              }
              handleCancelEditTrauma={handleCancelEditTrauma}
              handleDeleteCopingSkillComment={handleDeleteCopingSkillComment}
              handleDeleteDevStage={handleDeleteDevStage}
              handleDeleteImpact={handleDeleteImpact}
              handleDeleteReporter={handleDeleteReporter}
              handleDeleteTrauma={handleDeleteTrauma}
              handleDeleteTraumaComment={handleDeleteTraumaComment}
              handleEditCopingSkillComment={handleEditCopingSkillComment}
              handleEditTrauma={handleEditTrauma}
              handleSaveTrauma={handleSaveTrauma}
              handleUpdateCopingSkill={handleUpdateCopingSkill}
              handleUpdateCopingSkillComment={handleUpdateCopingSkillComment}
              newCopingSkillComment={newCopingSkillComment}
              newDevStage={newDevStage}
              newImpact={newImpact}
              newReporter={newReporter}
              newTrauma={newTrauma}
              newTraumaCommentData={newTraumaCommentData}
              setCommentsModalOpen={setCommentsModalOpen}
              setEditCopingSkillData={setEditCopingSkillData}
              setEditTraumaData={setEditTraumaData}
              setExpandedTraumaId={setExpandedTraumaId}
              setNewCopingSkillComment={setNewCopingSkillComment}
              setNewDevStage={setNewDevStage}
              setNewImpact={setNewImpact}
              setNewReporter={setNewReporter}
              setNewTrauma={setNewTrauma}
              setNewTraumaCommentData={setNewTraumaCommentData}
              setShowAddDevStage={setShowAddDevStage}
              setShowAddImpact={setShowAddImpact}
              setShowAddReporter={setShowAddReporter}
              setShowAddTrauma={setShowAddTrauma}
              setShowAddTraumaComment={setShowAddTraumaComment}
              showAddDevStage={showAddDevStage}
              showAddImpact={showAddImpact}
              showAddReporter={showAddReporter}
              showAddTrauma={showAddTrauma}
              showAddTraumaComment={showAddTraumaComment}
              showEditCopingSkillModal={showEditCopingSkillModal}
              traumaHistory={traumaHistory}
              hiddenTabs={hiddenTabs}
            />
          </div>
        </div>
      </div>
      <Dialog open={commentsModalOpen} onOpenChange={setCommentsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold text-[#080707]">
              Comments
            </DialogTitle>
            <DialogDescription className="text-[12px] text-[#706e6b]">
              {selectedGoalForComments?.goal}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Comments List */}
            <div className="space-y-3">
              {selectedGoalForComments?.comments &&
              selectedGoalForComments.comments.length > 0 ? (
                selectedGoalForComments.comments.map((comment: any) => (
                  <div
                    key={comment.id}
                    className="p-3 rounded"
                    style={{
                      backgroundColor: "#fafaf9",
                      border: "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-[#080707]">
                        {comment.author}
                      </span>
                      <span className="text-[10px] text-[#706e6b]">
                        {comment.date} at {comment.time}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#080707] leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[12px] text-[#706e6b] italic text-center py-8">
                  No comments yet. Add one below to get started.
                </p>
              )}
            </div>

            {/* Add Comment Form */}
            <div
              className="pt-4 border-t"
              style={{ borderColor: "var(--slds-g-color-border-base-1)" }}
            >
              <Label className="text-[11px] font-semibold text-[#080707] mb-1.5 block">
                Add New Comment
              </Label>
              <Textarea
                value={newGoalComment}
                onChange={(e) => setNewGoalComment(e.target.value)}
                placeholder="Type your comment here..."
                className="text-[12px] rounded resize-none min-h-[80px] mb-3"
                style={{
                  backgroundColor: "var(--slds-g-color-background-base)",
                  borderColor: "var(--slds-g-color-border-base-1)",
                }}
              />
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => {
                    setCommentsModalOpen(false)
                    setNewGoalComment("")
                  }}
                  className="h-8 px-4 rounded-full text-[12px]"
                  style={{
                    backgroundColor: "transparent",
                    color: "#706e6b",
                    border: "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedGoalForComments) {
                      handleAddComment(selectedGoalForComments.id)
                      setCommentsModalOpen(false)
                    }
                  }}
                  className="h-8 px-4 rounded-full text-[12px]"
                  style={{
                    backgroundColor: "#145F33",
                    color: "white",
                  }}
                  disabled={!newGoalComment.trim()}
                >
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
