import { useState } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Target, Plus, Pencil, Trash2, ChevronDown, ChevronRight, MessageSquare } from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso, formatMdy, toLocalIso } from "../../lib/dateFormat";

interface Comment {
    id: number;
    author: string;
    date: string;
    time: string;
    text: string;
}

interface Goal {
    id: number;
    goal: string;
    goalText?: string;
    targetDate: string;
    progress: number;
    status: string;
    category: string;
    parentId: number | null;
    description: string;
    enrollee: string;
    pointPersonName?: string;
    outcomeDomain?: string;
    reasonForGoal?: string;
    startDate?: string;
    targetDuration?: string;
    targetEndDate?: string;
    endDate?: string;
    youthNotes?: string;
    badgeType?: string;
    enrolleeCount?: number;
    relatedPTPStatement?: string;
    goalPercentage?: string;
    comments?: Comment[];
}

export function PersonalDevelopmentGoalsSection() {
    const [goals, setGoals] = useState<Goal[]>([
        // Goal 1: Emotional Regulation
        { 
            id: 1, 
            goal: "Enhance Emotional Regulation and Mental Health Stability", 
            targetDate: "2026-07-15", 
            progress: 45,
            status: "In Progress",
            category: "Clinical/Behavioral",
            parentId: null,
            description: "This goal aims to support Marcus in developing comprehensive emotional regulation skills and achieving mental health stability through evidence-based therapeutic interventions. Focus includes identifying emotional triggers, implementing DBT skills for distress tolerance, practicing mindfulness techniques, and building a robust toolkit of healthy coping mechanisms.",
            enrollee: "Marcus Thompson",
            pointPersonName: "Dr. Sarah Johnson, PsyD",
            outcomeDomain: "Mental Health & Emotional Wellness",
            reasonForGoal: "Marcus has a history of depression and anxiety related to childhood trauma. Recent psychiatric evaluation indicated need for intensive therapeutic support to address emotional dysregulation and develop healthier coping patterns.",
            startDate: "2025-01-20",
            targetEndDate: "2026-07-15",
            youthNotes: "I'm tired of feeling out of control with my emotions. I want to learn healthier ways to cope when life gets hard.",
            comments: [
                {
                    id: 1,
                    author: "Dr. Sarah Johnson, PsyD",
                    date: "Jan 13, 2026",
                    time: "3:15 PM",
                    text: "Marcus successfully utilized the TIPP skill during a dysregulated moment today. He used cold water on his face and paced breathing to bring himself down from a 9/10 distress to a 4/10."
                }
            ]
        },
        { 
            id: 2, 
            goal: "Practice DBT distress tolerance skills daily and maintain mood journal", 
            targetDate: "2026-04-15", 
            progress: 60,
            status: "In Progress",
            category: "Intermediate Goal",
            parentId: 1,
            description: "Utilize assigned DBT distress tolerance skills (TIPP, ACCEPTS, self-soothing) minimum once daily during emotional distress. Complete daily mood tracking journal.",
            enrollee: "Marcus Thompson",
            enrolleeCount: 1,
            startDate: "2025-01-20",
            targetEndDate: "2026-04-15",
            pointPersonName: "Dr. Sarah Johnson, PsyD",
            outcomeDomain: "Mental Health & Emotional Wellness",
            reasonForGoal: "Consistent practice of DBT skills is essential for skill internalization and generalization to real-world situations.",
            youthNotes: "Tracking my moods helps me see patterns I didn't notice before. I'm getting better at remembering to use my skills."
        },
        { 
            id: 3, 
            goal: "Reduce self-harm urges through crisis plan implementation", 
            targetDate: "2026-05-30", 
            progress: 42,
            status: "In Progress",
            category: "Intermediate Goal",
            parentId: 1,
            description: "Follow personalized crisis safety plan when experiencing urges to self-harm. Plan includes immediate use of sensory grounding techniques, contacting support person.",
            enrollee: "Marcus Thompson",
            enrolleeCount: 1,
            startDate: "2025-01-20",
            targetEndDate: "2026-05-30",
            pointPersonName: "Dr. Sarah Johnson, PsyD",
            outcomeDomain: "Mental Health & Emotional Wellness",
            reasonForGoal: "Self-harm behaviors put Marcus at risk and indicate need for stronger crisis management skills.",
            youthNotes: "It's hard when I get the urge, but I'm trying to use my crisis plan instead. Sometimes it works."
        },
        { 
            id: 4, 
            goal: "Attend weekly individual therapy sessions consistently", 
            targetDate: "2026-06-30", 
            progress: 78,
            status: "On Track",
            category: "Intermediate Goal",
            parentId: 1,
            description: "Maintain 95% attendance rate for weekly individual therapy sessions. Actively participate and complete therapeutic homework assignments.",
            enrollee: "Marcus Thompson",
            enrolleeCount: 1,
            startDate: "2025-01-20",
            targetEndDate: "2026-06-30",
            pointPersonName: "Dr. Sarah Johnson, PsyD",
            outcomeDomain: "Mental Health & Emotional Wellness",
            reasonForGoal: "Consistent therapeutic engagement is foundational to achieving mental health stability.",
            youthNotes: "Therapy is helping. I actually look forward to our sessions now."
        },

        // Goal 2: Family Connections
        { 
            id: 5, 
            goal: "Rebuild and Strengthen Family Connections", 
            targetDate: "2026-08-30", 
            progress: 28,
            status: "In Progress",
            category: "Family Engagement",
            parentId: null,
            description: "This comprehensive family-focused goal seeks to repair and enhance the relationship between Marcus and his biological mother through structured family therapy, gradual reintegration activities, and development of healthy communication patterns.",
            enrollee: "Marcus Thompson",
            pointPersonName: "Carlos Martinez, LMFT",
            outcomeDomain: "Family Relationships & Permanency",
            reasonForGoal: "Marcus entered care following family crisis. Both Marcus and his mother have expressed desire for reunification. Family therapy is critical to address relational issues and rebuild trust.",
            startDate: "2025-02-01",
            targetEndDate: "2026-08-30",
            youthNotes: "I miss my mom but I'm also scared. I want our relationship to be better this time.",
            badgeType: "TOP GOAL",
            comments: []
        },
        { 
            id: 6, 
            goal: "Complete bi-weekly family therapy sessions", 
            targetDate: "2026-06-30", 
            progress: 45,
            status: "In Progress",
            category: "Intermediate Goal",
            parentId: 5,
            description: "Attend all scheduled bi-weekly family therapy sessions. Actively participate by practicing active listening, using I-statements, and expressing feelings appropriately.",
            enrollee: "Marcus Thompson",
            enrolleeCount: 1,
            startDate: "2025-02-01",
            targetEndDate: "2026-06-30",
            pointPersonName: "Carlos Martinez, LMFT",
            outcomeDomain: "Family Relationships & Permanency",
            reasonForGoal: "Regular family therapy participation is essential for processing past trauma and building trust.",
            youthNotes: "Family therapy is hard but I know it's important. I'm learning how to communicate better."
        },
        { 
            id: 7, 
            goal: "Participate in supervised family visits with positive engagement", 
            targetDate: "2026-07-15", 
            progress: 35,
            status: "In Progress",
            category: "Intermediate Goal",
            parentId: 5,
            description: "Attend monthly supervised family visits with mother, maintaining respectful communication and managing emotions appropriately.",
            enrollee: "Marcus Thompson",
            enrolleeCount: 1,
            startDate: "2025-02-01",
            targetEndDate: "2026-07-15",
            pointPersonName: "Carlos Martinez, LMFT",
            outcomeDomain: "Family Relationships & Permanency",
            reasonForGoal: "Supervised visits provide safe opportunities to practice new communication skills.",
            youthNotes: "I look forward to seeing my mom during visits. We're learning to enjoy being together."
        },

        // Goal 3: Academic Performance
        { 
            id: 8, 
            goal: "Improve Academic Performance and School Engagement", 
            targetDate: "2026-06-30", 
            progress: 58,
            status: "On Track",
            category: "Educational",
            parentId: null,
            description: "This educational goal centers on improving Marcus's academic outcomes through increased school attendance, enhanced study skills, consistent completion of assignments, and active classroom participation. Includes twice-weekly tutoring sessions and development of organizational systems.",
            enrollee: "Marcus Thompson",
            pointPersonName: "Michael Chen, Education Advocate",
            outcomeDomain: "Education & Academic Achievement",
            reasonForGoal: "Marcus's academic performance suffered during family instability. He is currently behind in credits needed for on-time graduation. Academic success is crucial for his self-esteem and future opportunities.",
            startDate: "2025-01-20",
            targetEndDate: "2026-06-30",
            youthNotes: "School has always been hard for me. I want to do better and graduate with my class.",
            comments: [
                {
                    id: 1,
                    author: "Michael Chen, Education Advocate",
                    date: "Jan 12, 2026",
                    time: "4:00 PM",
                    text: "Marcus's English teacher reported he submitted a beautifully written essay. Building confidence in his writing abilities."
                }
            ]
        },
        { 
            id: 9, 
            goal: "Achieve 90% or higher school attendance", 
            targetDate: "2026-05-30", 
            progress: 72,
            status: "On Track",
            category: "Intermediate Goal",
            parentId: 8,
            description: "Maintain minimum 90% school attendance rate throughout spring semester. Utilize morning routine checklist to ensure timely departure.",
            enrollee: "Marcus Thompson",
            enrolleeCount: 1,
            startDate: "2025-01-20",
            targetEndDate: "2026-05-30",
            pointPersonName: "Michael Chen, Education Advocate",
            outcomeDomain: "Education & Academic Achievement",
            reasonForGoal: "Consistent school attendance is foundational to academic success and credit accumulation.",
            youthNotes: "I'm proud that I've been going to school almost every day. The routine helps."
        },
        { 
            id: 10, 
            goal: "Complete all homework assignments using organizational system", 
            targetDate: "2026-06-15", 
            progress: 55,
            status: "In Progress",
            category: "Intermediate Goal",
            parentId: 8,
            description: "Turn in 95% of homework assignments on time. Use planner and folder system to track assignments and due dates.",
            enrollee: "Marcus Thompson",
            enrolleeCount: 1,
            startDate: "2025-01-20",
            targetEndDate: "2026-06-15",
            pointPersonName: "Michael Chen, Education Advocate",
            outcomeDomain: "Education & Academic Achievement",
            reasonForGoal: "Homework completion directly impacts grades and demonstrates academic engagement.",
            youthNotes: "The planner is actually helping me keep track of everything."
        },
        { 
            id: 11, 
            goal: "Participate in tutoring sessions twice weekly", 
            targetDate: "2026-06-20", 
            progress: 68,
            status: "On Track",
            category: "Intermediate Goal",
            parentId: 8,
            description: "Attend all scheduled tutoring sessions in math and English. Come prepared with questions and homework.",
            enrollee: "Marcus Thompson",
            enrolleeCount: 1,
            startDate: "2025-01-20",
            targetEndDate: "2026-06-20",
            pointPersonName: "Michael Chen, Education Advocate",
            outcomeDomain: "Education & Academic Achievement",
            reasonForGoal: "Tutoring provides targeted academic support in challenging subjects.",
            youthNotes: "My tutor is patient and explains things in ways I understand."
        },

        // Goal 4: Life Skills Development
        { 
            id: 12, 
            goal: "Develop Independent Living and Life Skills", 
            targetDate: "2026-09-30", 
            progress: 38,
            status: "In Progress",
            category: "Life Skills/Transition",
            parentId: null,
            description: "Build comprehensive independent living skills including budgeting, meal planning, cooking, laundry, time management, and basic household maintenance. Participate in life skills workshops and practice skills in supervised settings.",
            enrollee: "Marcus Thompson",
            pointPersonName: "Jennifer Lee, Life Skills Coordinator",
            outcomeDomain: "Life Skills & Independent Living",
            reasonForGoal: "Marcus will age out of care in 24 months and needs practical life skills for successful transition to independent living. Current assessment shows gaps in basic household management and financial literacy.",
            startDate: "2025-02-15",
            targetEndDate: "2026-09-30",
            youthNotes: "I never learned this stuff at home. I know I'll need it when I'm on my own.",
            comments: []
        },
        { 
            id: 13, 
            goal: "Create and maintain monthly budget", 
            targetDate: "2026-07-30", 
            progress: 40,
            status: "In Progress",
            category: "Intermediate Goal",
            parentId: 12,
            description: "Develop monthly budget tracking income and expenses. Save 20% of allowance each month.",
            enrollee: "Marcus Thompson",
            enrolleeCount: 1,
            startDate: "2025-02-15",
            targetEndDate: "2026-07-30",
            pointPersonName: "Jennifer Lee, Life Skills Coordinator",
            outcomeDomain: "Life Skills & Independent Living",
            reasonForGoal: "Financial literacy is critical for independent living success.",
            youthNotes: "Budgeting is harder than I thought but I'm learning."
        },
        { 
            id: 14, 
            goal: "Prepare three balanced meals per week independently", 
            targetDate: "2026-08-15", 
            progress: 50,
            status: "In Progress",
            category: "Intermediate Goal",
            parentId: 12,
            description: "Plan, shop for, and prepare nutritious meals. Follow recipes and practice kitchen safety.",
            enrollee: "Marcus Thompson",
            enrolleeCount: 1,
            startDate: "2025-02-15",
            targetEndDate: "2026-08-15",
            pointPersonName: "Jennifer Lee, Life Skills Coordinator",
            outcomeDomain: "Life Skills & Independent Living",
            reasonForGoal: "Cooking skills promote healthy eating and self-sufficiency.",
            youthNotes: "I actually enjoy cooking now. It's relaxing."
        },
        { 
            id: 15, 
            goal: "Complete personal laundry weekly without reminders", 
            targetDate: "2026-06-01", 
            progress: 65,
            status: "On Track",
            category: "Intermediate Goal",
            parentId: 12,
            description: "Wash, dry, fold, and put away personal laundry independently each week.",
            enrollee: "Marcus Thompson",
            enrolleeCount: 1,
            startDate: "2025-02-15",
            targetEndDate: "2026-06-01",
            pointPersonName: "Jennifer Lee, Life Skills Coordinator",
            outcomeDomain: "Life Skills & Independent Living",
            reasonForGoal: "Basic self-care skills demonstrate readiness for independence.",
            youthNotes: "I've got this one down. It's part of my Sunday routine now."
        },

        // Goal 5: Social Skills and Peer Relationships
        { 
            id: 16, 
            goal: "Build Healthy Peer Relationships and Social Skills", 
            targetDate: "2026-07-31", 
            progress: 32,
            status: "In Progress",
            category: "Social/Emotional",
            parentId: null,
            description: "Develop and maintain positive peer relationships using appropriate social skills. Practice conflict resolution, active listening, empathy, and healthy boundary setting. Participate in group activities and social skills training.",
            enrollee: "Marcus Thompson",
            pointPersonName: "David Martinez, Social Worker",
            outcomeDomain: "Social Connections & Support",
            reasonForGoal: "Marcus has difficulty forming and maintaining friendships due to trust issues and past trauma. Healthy peer relationships are essential for emotional well-being and support network development.",
            startDate: "2025-01-25",
            targetEndDate: "2026-07-31",
            youthNotes: "Making friends has always been hard. I want to get better at it.",
            comments: []
        },
        { 
            id: 17, 
            goal: "Participate in weekly social skills group", 
            targetDate: "2026-06-30", 
            progress: 48,
            status: "In Progress",
            category: "Intermediate Goal",
            parentId: 16,
            description: "Attend weekly social skills group sessions. Practice communication skills and receive peer feedback.",
            enrollee: "Marcus Thompson",
            enrolleeCount: 1,
            startDate: "2025-01-25",
            targetEndDate: "2026-06-30",
            pointPersonName: "David Martinez, Social Worker",
            outcomeDomain: "Social Connections & Support",
            reasonForGoal: "Structured group setting provides safe environment for practicing social skills.",
            youthNotes: "The group is helpful. I'm not the only one who struggles with this."
        },
        { 
            id: 18, 
            goal: "Initiate and maintain one positive peer friendship", 
            targetDate: "2026-08-15", 
            progress: 25,
            status: "In Progress",
            category: "Intermediate Goal",
            parentId: 16,
            description: "Build genuine friendship with at least one peer. Practice regular communication and shared activities.",
            enrollee: "Marcus Thompson",
            enrolleeCount: 1,
            startDate: "2025-01-25",
            targetEndDate: "2026-08-15",
            pointPersonName: "David Martinez, Social Worker",
            outcomeDomain: "Social Connections & Support",
            reasonForGoal: "Quality friendships provide emotional support and sense of belonging.",
            youthNotes: "There's a guy in my class I've been talking to. Maybe we'll become friends."
        },
        { 
            id: 19, 
            goal: "Resolve conflicts using healthy communication strategies", 
            targetDate: "2026-07-20", 
            progress: 38,
            status: "In Progress",
            category: "Intermediate Goal",
            parentId: 16,
            description: "Use conflict resolution skills when disagreements arise. Practice staying calm and expressing needs respectfully.",
            enrollee: "Marcus Thompson",
            enrolleeCount: 1,
            startDate: "2025-01-25",
            targetEndDate: "2026-07-20",
            pointPersonName: "David Martinez, Social Worker",
            outcomeDomain: "Social Connections & Support",
            reasonForGoal: "Healthy conflict resolution prevents relationship breakdowns.",
            youthNotes: "I'm trying not to blow up when things don't go my way."
        },

        // Goal 6: Physical Health and Wellness
        { 
            id: 20, 
            goal: "Establish Healthy Physical Wellness Habits", 
            targetDate: "2026-08-30", 
            progress: 52,
            status: "On Track",
            category: "Physical Health",
            parentId: null,
            description: "Develop and maintain healthy habits including regular exercise, balanced nutrition, adequate sleep, and proper hygiene. Participate in recreational activities and annual health screenings.",
            enrollee: "Marcus Thompson",
            pointPersonName: "Dr. Amanda Wilson, Pediatrician",
            outcomeDomain: "Physical Health & Wellness",
            reasonForGoal: "Physical wellness supports overall mental health and prepares Marcus for independent living. Current assessment shows irregular sleep patterns and limited physical activity.",
            startDate: "2025-02-01",
            targetEndDate: "2026-08-30",
            youthNotes: "I know I need to take better care of myself. I want to feel healthier.",
            comments: []
        },
        { 
            id: 21, 
            goal: "Exercise 30 minutes at least 4 days per week", 
            targetDate: "2026-07-15", 
            progress: 58,
            status: "On Track",
            category: "Intermediate Goal",
            parentId: 20,
            description: "Engage in physical activity through sports, gym, walks, or recreational activities.",
            enrollee: "Marcus Thompson",
            enrolleeCount: 1,
            startDate: "2025-02-01",
            targetEndDate: "2026-07-15",
            pointPersonName: "Dr. Amanda Wilson, Pediatrician",
            outcomeDomain: "Physical Health & Wellness",
            reasonForGoal: "Regular exercise improves mood, reduces anxiety, and promotes physical health.",
            youthNotes: "Basketball has become my thing. I play almost every day now."
        },
        { 
            id: 22, 
            goal: "Maintain consistent sleep schedule with 8 hours nightly", 
            targetDate: "2026-06-30", 
            progress: 45,
            status: "In Progress",
            category: "Intermediate Goal",
            parentId: 20,
            description: "Establish bedtime routine and wake at consistent times. Limit screen time before bed.",
            enrollee: "Marcus Thompson",
            enrolleeCount: 1,
            startDate: "2025-02-01",
            targetEndDate: "2026-06-30",
            pointPersonName: "Dr. Amanda Wilson, Pediatrician",
            outcomeDomain: "Physical Health & Wellness",
            reasonForGoal: "Adequate sleep is essential for emotional regulation and academic performance.",
            youthNotes: "The sleep schedule is still hard but I'm working on it."
        },
        { 
            id: 23, 
            goal: "Attend all scheduled medical and dental appointments", 
            targetDate: "2026-08-30", 
            progress: 82,
            status: "Exceeding",
            category: "Intermediate Goal",
            parentId: 20,
            description: "Keep all medical, dental, and vision appointments. Follow medical recommendations.",
            enrollee: "Marcus Thompson",
            enrolleeCount: 1,
            startDate: "2025-02-01",
            targetEndDate: "2026-08-30",
            pointPersonName: "Dr. Amanda Wilson, Pediatrician",
            outcomeDomain: "Physical Health & Wellness",
            reasonForGoal: "Preventive healthcare maintains overall wellness.",
            youthNotes: "I've been really good about making my appointments."
        }
    ]);

    const [showAddGoal, setShowAddGoal] = useState<number | null | 'top'>(null);
    const [expandedGoals, setExpandedGoals] = useState<number[]>([1]);
    const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
    const [showCommentForm, setShowCommentForm] = useState<number | null>(null);
    const [newComment, setNewComment] = useState("");
    const [expandedComments, setExpandedComments] = useState<number[]>([]);
    
    const [newGoal, setNewGoal] = useState<Partial<Goal>>({
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
        enrollee: "Marcus Thompson",
        badgeType: "",
        enrolleeCount: 0,
        youthNotes: ""
    });

    const [editGoalData, setEditGoalData] = useState<any>({
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
        parentId: null
    });

    const calculateOverallProgress = () => {
        const parentGoals = goals.filter(g => g.parentId === null);
        if (parentGoals.length === 0) return 0;
        const totalProgress = parentGoals.reduce((sum, g) => sum + g.progress, 0);
        return Math.round(totalProgress / parentGoals.length);
    };

    const handleAddGoal = () => {
        if (!newGoal.goal) return;
        
        const newId = Math.max(...goals.map(g => g.id), 0) + 1;
        const isSubGoal = newGoal.parentId !== null && newGoal.parentId !== undefined;
        
        setGoals([...goals, { 
            id: newId, 
            goal: newGoal.goal,
            goalText: newGoal.goalText || newGoal.goal,
            targetDate: newGoal.targetEndDate || newGoal.targetDate || "2025-12-31",
            category: newGoal.category || (isSubGoal ? "Intermediate Goal" : "General"),
            parentId: newGoal.parentId || null,
            progress: parseInt(newGoal.goalPercentage || "0") || 0,
            status: "In Progress",
            description: newGoal.description || newGoal.goalText || "No description provided",
            enrollee: newGoal.enrollee || "Marcus Thompson",
            badgeType: newGoal.badgeType || "",
            enrolleeCount: 1,
            pointPersonName: newGoal.pointPersonName,
            outcomeDomain: newGoal.outcomeDomain,
            reasonForGoal: newGoal.reasonForGoal,
            startDate: newGoal.startDate,
            targetDuration: newGoal.targetDuration,
            targetEndDate: newGoal.targetEndDate,
            endDate: newGoal.endDate,
            youthNotes: newGoal.youthNotes,
            relatedPTPStatement: newGoal.relatedPTPStatement,
            comments: []
        }]);
        
        setShowAddGoal(null);
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
            enrollee: "Marcus Thompson",
            badgeType: "",
            enrolleeCount: 0,
            youthNotes: ""
        });
    };

    const handleEditGoal = (id: number) => {
        const goal = goals.find(g => g.id === id);
        if (goal) {
            setEditingGoalId(id);
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
                parentId: goal.parentId
            });
        }
    };

    const handleSaveGoal = () => {
        if (!editGoalData.goal) return;
        
        setGoals(goals.map(g => {
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
                    youthNotes: editGoalData.youthNotes
                };
            }
            return g;
        }));
        
        setEditingGoalId(null);
    };

    const handleCancelEditGoal = () => {
        setEditingGoalId(null);
    };

    const handleDeleteGoal = (id: number) => {
        const goal = goals.find(g => g.id === id);
        if (goal && goal.parentId === null) {
            setGoals(goals.filter(g => g.id !== id && g.parentId !== id));
        } else {
            setGoals(goals.filter(g => g.id !== id));
        }
    };

    const toggleGoalExpansion = (goalId: number) => {
        setExpandedGoals(prev => 
            prev.includes(goalId) 
                ? prev.filter(id => id !== goalId)
                : [...prev, goalId]
        );
    };

    const updateGoalProgress = (goalId: number, newProgress: number) => {
        setGoals(goals.map(g => {
            if (g.id === goalId) {
                return { 
                    ...g, 
                    progress: newProgress,
                    status: newProgress >= 75 ? "Exceeding" : newProgress >= 50 ? "On Track" : "In Progress"
                };
            }
            return g;
        }));
    };

    const toggleComments = (goalId: number) => {
        setExpandedComments(prev =>
            prev.includes(goalId)
                ? prev.filter(id => id !== goalId)
                : [...prev, goalId]
        );
    };

    const handleAddComment = (goalId: number) => {
        if (!newComment.trim()) return;
        
        setGoals(goals.map(g => {
            if (g.id === goalId) {
                const newCommentObj: Comment = {
                    id: (g.comments?.length || 0) + 1,
                    author: "Staff Member",
                    date: formatMdy(new Date()),
                    time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                    text: newComment
                };
                return {
                    ...g,
                    comments: [...(g.comments || []), newCommentObj]
                };
            }
            return g;
        }));
        
        setNewComment("");
        setShowCommentForm(null);
    };

    return (
        <div className="space-y-5">
            {/* Header Section */}
            <div 
                className="rounded-lg p-6"
                style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)'
                }}
            >
                <div className="mb-4">
                    <div className="flex items-center justify-between gap-6 mb-3">
                        <div className="flex items-stretch gap-3 flex-1">
                            <div className="flex items-center" style={{ color: '#145F33' }}>
                                <Target className="w-10 h-10" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="text-[16px] font-semibold text-[#080707]">Treatment Goals</h3>
                                <p className="text-[13px] text-[#706e6b] mt-0.5">Marcus Thompson</p>
                            </div>
                        </div>
                        
                        <Button
                            onClick={() => {
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
                                    enrollee: "Marcus Thompson",
                                    badgeType: "",
                                    enrolleeCount: 0,
                                    youthNotes: ""
                                });
                                setShowAddGoal(showAddGoal === 'top' ? null : 'top');
                            }}
                            className="h-9 px-4 rounded-full text-[13px] font-medium"
                            style={{
                                backgroundColor: '#145F33',
                                color: 'white'
                            }}
                        >
                            <Plus className="w-4 h-4 mr-1.5" />
                            New Goal
                        </Button>
                    </div>
                    
                    {/* Overall Progress Stats */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-[13px] font-semibold text-[#145F33]">
                                    {calculateOverallProgress()}%
                                </span>
                                <span className="text-[11px] text-[#706e6b]">
                                    {goals.filter(g => g.parentId === null && g.progress === 100).length}/{goals.filter(g => g.parentId === null).length} Complete
                                </span>
                            </div>
                            <div 
                                className="h-2 rounded-full overflow-hidden"
                                style={{ backgroundColor: 'var(--slds-g-color-border-base-1)' }}
                            >
                                <div 
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                        width: `${calculateOverallProgress()}%`,
                                        backgroundColor: '#145F33'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Top-Level Goal Form */}
            {showAddGoal === 'top' && (
                <div 
                    className="p-5 rounded"
                    style={{
                        backgroundColor: 'var(--slds-g-color-background-alt)',
                        border: '1px solid var(--slds-g-color-border-base-1)'
                    }}
                >
                    <div className="space-y-4">
                        {/* Goal Title */}
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">Goal Title *</Label>
                            <Input
                                value={newGoal.goal}
                                onChange={(e) => setNewGoal({...newGoal, goal: e.target.value})}
                                className="h-9 text-[13px] rounded"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                }}
                                placeholder="Enter goal title"
                            />
                        </div>

                        {/* Goal Description */}
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">Goal *</Label>
                            <Textarea
                                value={newGoal.goalText}
                                onChange={(e) => setNewGoal({...newGoal, goalText: e.target.value, description: e.target.value})}
                                className="min-h-[80px] text-[13px] rounded resize-none"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                }}
                                placeholder="Enter detailed goal description..."
                            />
                        </div>

                        {/* Related PTP Statement */}
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">Related PTP Statement</Label>
                            <select
                                value={newGoal.relatedPTPStatement}
                                onChange={(e) => setNewGoal({...newGoal, relatedPTPStatement: e.target.value})}
                                className="h-9 text-[13px] rounded w-full px-2.5"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                }}
                            >
                                <option value="">-- Select PTP Statement --</option>
                                <option value="Trauma-Informed Care">Trauma-Informed Care</option>
                                <option value="Family Engagement">Family Engagement</option>
                                <option value="Life Skills Development">Life Skills Development</option>
                                <option value="Educational Support">Educational Support</option>
                                <option value="Mental Health Services">Mental Health Services</option>
                            </select>
                        </div>

                        {/* Reason for Goal */}
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">Reason for Goal *</Label>
                            <Textarea
                                value={newGoal.reasonForGoal}
                                onChange={(e) => setNewGoal({...newGoal, reasonForGoal: e.target.value})}
                                className="min-h-[80px] text-[13px] rounded resize-none"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                }}
                                placeholder="Explain why this goal is important..."
                            />
                        </div>

                        {/* Point Person */}
                        <div>
                            <div className="mb-2">
                                <h4 className="text-[12px] font-semibold text-[#080707]">Point Person</h4>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[#080707]">Name *</Label>
                                <Input
                                    value={newGoal.pointPersonName}
                                    onChange={(e) => setNewGoal({...newGoal, pointPersonName: e.target.value})}
                                    className="h-9 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Enter point person name"
                                />
                            </div>
                        </div>

                        {/* Outcome Domain */}
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">Outcome Domain</Label>
                            <select
                                value={newGoal.outcomeDomain}
                                onChange={(e) => setNewGoal({...newGoal, outcomeDomain: e.target.value})}
                                className="h-9 text-[13px] rounded w-full px-2.5"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    borderColor: 'var(--slds-g-color-border-base-1)',
                                    border: '1px solid var(--slds-g-color-border-base-1)'
                                }}
                            >
                                <option value="">-- Select Outcome Domain --</option>
                                <option value="Clinical/Behavioral">Clinical/Behavioral</option>
                                <option value="Educational">Educational</option>
                                <option value="Family Engagement">Family Engagement</option>
                                <option value="Life Skills/Transition">Life Skills/Transition</option>
                                <option value="Social/Emotional">Social/Emotional</option>
                                <option value="Physical Health">Physical Health</option>
                            </select>
                        </div>

                        {/* Dates Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[#080707]">Start Date *</Label>
                                <DateInput
value={isoToMdy(newGoal.startDate)}
                                    onChange={(v) => ((e) => {
                                        setNewGoal({...newGoal, startDate: e.target.value});
                                    })({ target: { value: mdyToIso(v) } })}
                                    className="h-9 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[#080707]">Target Duration</Label>
                                <select
                                    value={newGoal.targetDuration}
                                    onChange={(e) => {
                                        const duration = e.target.value;
                                        setNewGoal({...newGoal, targetDuration: duration});
                                        
                                        // Auto-calculate target end date if start date is set
                                        if (newGoal.startDate && duration) {
                                            const startDate = new Date(newGoal.startDate);
                                            const months = parseInt(duration);
                                            const targetEnd = new Date(startDate);
                                            targetEnd.setMonth(targetEnd.getMonth() + months);
                                            setNewGoal({...newGoal, targetDuration: duration, targetEndDate: toLocalIso(targetEnd), targetDate: toLocalIso(targetEnd)});
                                        }
                                    }}
                                    className="h-9 text-[13px] rounded w-full px-2.5"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)',
                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                    }}
                                >
                                    <option value="">-- Select Duration --</option>
                                    <option value="3">3 Months</option>
                                    <option value="6">6 Months</option>
                                    <option value="9">9 Months</option>
                                    <option value="12">12 Months</option>
                                    <option value="18">18 Months</option>
                                    <option value="24">24 Months</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[#080707]">Target End Date</Label>
                                <DateInput
value={isoToMdy(newGoal.targetEndDate)}
                                    onChange={(v) => ((e) => setNewGoal({...newGoal, targetEndDate: e.target.value, targetDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                    className="h-9 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[#080707]">End Date</Label>
                                <DateInput
value={isoToMdy(newGoal.endDate)}
                                    onChange={(v) => ((e) => setNewGoal({...newGoal, endDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                    className="h-9 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Enrollee and Goal Percentage Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[#080707]">Enrollee *</Label>
                                <Input
                                    value={newGoal.enrollee}
                                    onChange={(e) => setNewGoal({...newGoal, enrollee: e.target.value})}
                                    className="h-9 text-[13px] rounded"
                                    style={{
                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                    }}
                                    placeholder="Youth name"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[11px] font-semibold text-[#080707]">Goal Percentage</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={newGoal.goalPercentage}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
                                                setNewGoal({...newGoal, goalPercentage: value, progress: parseInt(value) || 0});
                                            }
                                        }}
                                        className="h-9 text-[13px] rounded pr-8"
                                        style={{
                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                        }}
                                        placeholder="0"
                                    />
                                    <span 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] pointer-events-none"
                                        style={{ color: 'var(--slds-g-color-text-weak)' }}
                                    >
                                        %
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-semibold text-[#080707]">Category *</Label>
                            <Input
                                value={newGoal.category}
                                onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                                className="h-9 text-[13px] rounded"
                                style={{
                                    backgroundColor: 'var(--slds-g-color-background-base)',
                                    borderColor: 'var(--slds-g-color-border-base-1)'
                                }}
                                placeholder="e.g., Clinical/Behavioral, Educational"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-5 pt-4" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                        <Button
                            onClick={() => {
                                setShowAddGoal(null);
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
                                    enrollee: "Marcus Thompson",
                                    badgeType: "",
                                    enrolleeCount: 0,
                                    youthNotes: ""
                                });
                            }}
                            className="h-9 px-4 rounded-full text-[13px] font-medium"
                            style={{
                                backgroundColor: 'transparent',
                                color: '#706e6b',
                                border: '1px solid var(--slds-g-color-border-base-1)'
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddGoal}
                            className="h-9 px-4 rounded-full text-[13px] font-medium"
                            style={{
                                backgroundColor: '#145F33',
                                color: 'white'
                            }}
                        >
                            Save Goal
                        </Button>
                    </div>
                </div>
            )}

            {/* Goals List */}
            <div className="space-y-3">
                {goals.filter(g => g.parentId === null).map((parentGoal) => {
                    const childGoals = goals.filter(g => g.parentId === parentGoal.id);
                    const isExpanded = expandedGoals.includes(parentGoal.id);
                    
                    return (
                        <div 
                            key={parentGoal.id}
                            className="rounded overflow-hidden"
                            style={{
                                border: '1px solid var(--slds-g-color-border-base-1)',
                                backgroundColor: 'var(--slds-g-color-background-base)'
                            }}
                        >
                            {/* Parent Goal Card */}
                            <div 
                                className="p-4 cursor-pointer"
                                onClick={() => toggleGoalExpansion(parentGoal.id)}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Expand/Collapse Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleGoalExpansion(parentGoal.id);
                                        }}
                                        className="mt-1 text-[#706e6b] hover:text-[#145F33]"
                                    >
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4" />
                                        )}
                                    </button>
                                    
                                    {/* Checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={parentGoal.progress === 100}
                                        onChange={() => updateGoalProgress(parentGoal.id, parentGoal.progress === 100 ? 0 : 100)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 bg-white"
                                        style={{
                                            accentColor: '#145F33',
                                            backgroundColor: 'white'
                                        }}
                                    />
                                    
                                    {/* Goal Content */}
                                    <div className="flex-1 min-w-0" onClick={(e) => {
                                        if (editingGoalId === parentGoal.id) {
                                            e.stopPropagation();
                                        }
                                    }}>
                                        {editingGoalId === parentGoal.id ? (
                                            /* Edit Form for Parent Goal */
                                            <div className="space-y-4">
                                                {/* Goal Title */}
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">Goal Title *</Label>
                                                    <Input
                                                        value={editGoalData.goal}
                                                        onChange={(e) => setEditGoalData({...editGoalData, goal: e.target.value})}
                                                        className="h-9 text-[13px] rounded"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                        }}
                                                        placeholder="Enter goal title"
                                                    />
                                                </div>

                                                {/* Goal (Rich Text Area) */}
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">Goal *</Label>
                                                    <Textarea
                                                        value={editGoalData.goalText}
                                                        onChange={(e) => setEditGoalData({...editGoalData, goalText: e.target.value})}
                                                        className="min-h-[80px] text-[13px] rounded resize-none"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                        }}
                                                        placeholder="Enter detailed goal description..."
                                                    />
                                                </div>

                                                {/* Related PTP Statement */}
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">Related PTP Statement</Label>
                                                    <select
                                                        value={editGoalData.relatedPTPStatement}
                                                        onChange={(e) => setEditGoalData({...editGoalData, relatedPTPStatement: e.target.value})}
                                                        className="h-9 text-[13px] rounded w-full px-2.5"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)',
                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                        }}
                                                    >
                                                        <option value="">-- Select PTP Statement --</option>
                                                        <option value="Trauma-Informed Care">Trauma-Informed Care</option>
                                                        <option value="Family Engagement">Family Engagement</option>
                                                        <option value="Life Skills Development">Life Skills Development</option>
                                                        <option value="Educational Support">Educational Support</option>
                                                        <option value="Mental Health Services">Mental Health Services</option>
                                                    </select>
                                                </div>

                                                {/* Reason for Goal (Rich Text Area) */}
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">Reason for Goal *</Label>
                                                    <Textarea
                                                        value={editGoalData.reasonForGoal}
                                                        onChange={(e) => setEditGoalData({...editGoalData, reasonForGoal: e.target.value})}
                                                        className="min-h-[80px] text-[13px] rounded resize-none"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                        }}
                                                        placeholder="Explain why this goal is important..."
                                                    />
                                                </div>

                                                {/* Point Person Section */}
                                                <div>
                                                    <div className="mb-2">
                                                        <h4 className="text-[12px] font-semibold text-[#080707]">Point Person</h4>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[11px] font-semibold text-[#080707]">Name *</Label>
                                                        <Input
                                                            value={editGoalData.pointPersonName}
                                                            onChange={(e) => setEditGoalData({...editGoalData, pointPersonName: e.target.value})}
                                                            className="h-9 text-[13px] rounded"
                                                            style={{
                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                            }}
                                                            placeholder="Enter point person name"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Outcome Domain */}
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">Outcome Domain</Label>
                                                    <select
                                                        value={editGoalData.outcomeDomain}
                                                        onChange={(e) => setEditGoalData({...editGoalData, outcomeDomain: e.target.value})}
                                                        className="h-9 text-[13px] rounded w-full px-2.5"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)',
                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                        }}
                                                    >
                                                        <option value="">-- Select Outcome Domain --</option>
                                                        <option value="Clinical/Behavioral">Clinical/Behavioral</option>
                                                        <option value="Educational">Educational</option>
                                                        <option value="Family Engagement">Family Engagement</option>
                                                        <option value="Life Skills/Transition">Life Skills/Transition</option>
                                                        <option value="Social/Emotional">Social/Emotional</option>
                                                        <option value="Physical Health">Physical Health</option>
                                                    </select>
                                                </div>

                                                {/* Dates Row */}
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[11px] font-semibold text-[#080707]">Start Date *</Label>
                                                        <DateInput
value={isoToMdy(editGoalData.startDate)}
                                                            onChange={(v) => ((e) => setEditGoalData({...editGoalData, startDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                            className="h-9 text-[13px] rounded"
                                                            style={{
                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[11px] font-semibold text-[#080707]">Target Duration</Label>
                                                        <select
                                                            value={editGoalData.targetDuration}
                                                            onChange={(e) => {
                                                                const duration = e.target.value;
                                                                setEditGoalData({...editGoalData, targetDuration: duration});
                                                                
                                                                // Auto-calculate target end date if start date is set
                                                                if (editGoalData.startDate && duration) {
                                                                    const startDate = new Date(editGoalData.startDate);
                                                                    const months = parseInt(duration);
                                                                    const targetEnd = new Date(startDate);
                                                                    targetEnd.setMonth(targetEnd.getMonth() + months);
                                                                    setEditGoalData({...editGoalData, targetDuration: duration, targetEndDate: toLocalIso(targetEnd)});
                                                                }
                                                            }}
                                                            className="h-9 text-[13px] rounded w-full px-2.5"
                                                            style={{
                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                borderColor: 'var(--slds-g-color-border-base-1)',
                                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                                            }}
                                                        >
                                                            <option value="">-- Select Duration --</option>
                                                            <option value="3">3 Months</option>
                                                            <option value="6">6 Months</option>
                                                            <option value="9">9 Months</option>
                                                            <option value="12">12 Months</option>
                                                            <option value="18">18 Months</option>
                                                            <option value="24">24 Months</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[11px] font-semibold text-[#080707]">Target End Date</Label>
                                                        <DateInput
value={isoToMdy(editGoalData.targetEndDate)}
                                                            onChange={(v) => ((e) => setEditGoalData({...editGoalData, targetEndDate: e.target.value, targetDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                            className="h-9 text-[13px] rounded"
                                                            style={{
                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[11px] font-semibold text-[#080707]">End Date</Label>
                                                        <DateInput
value={isoToMdy(editGoalData.endDate)}
                                                            onChange={(v) => ((e) => setEditGoalData({...editGoalData, endDate: e.target.value}))({ target: { value: mdyToIso(v) } })}
                                                            className="h-9 text-[13px] rounded"
                                                            style={{
                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Enrollee, Category, and Progress Row */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[11px] font-semibold text-[#080707]">Enrollee *</Label>
                                                        <Input
                                                            value={editGoalData.enrollee}
                                                            onChange={(e) => setEditGoalData({...editGoalData, enrollee: e.target.value})}
                                                            className="h-9 text-[13px] rounded"
                                                            style={{
                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                            }}
                                                            placeholder="Youth name"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[11px] font-semibold text-[#080707]">Category</Label>
                                                        <Input
                                                            value={editGoalData.category}
                                                            onChange={(e) => setEditGoalData({...editGoalData, category: e.target.value})}
                                                            className="h-9 text-[13px] rounded"
                                                            style={{
                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                            }}
                                                            placeholder="e.g., Clinical, Education"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[11px] font-semibold text-[#080707]">Progress (%)</Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={editGoalData.progress}
                                                            onChange={(e) => setEditGoalData({...editGoalData, progress: parseInt(e.target.value) || 0})}
                                                            className="h-9 text-[13px] rounded"
                                                            style={{
                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">Description</Label>
                                                    <Textarea
                                                        value={editGoalData.description}
                                                        onChange={(e) => setEditGoalData({...editGoalData, description: e.target.value})}
                                                        className="min-h-[80px] text-[13px] rounded resize-none"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                        }}
                                                        placeholder="Enter goal description..."
                                                    />
                                                </div>

                                                {/* Youth Notes */}
                                                <div className="space-y-1.5">
                                                    <Label className="text-[11px] font-semibold text-[#080707]">Youth Notes</Label>
                                                    <Textarea
                                                        value={editGoalData.youthNotes}
                                                        onChange={(e) => setEditGoalData({...editGoalData, youthNotes: e.target.value})}
                                                        className="text-[13px] rounded min-h-[60px] resize-none"
                                                        style={{
                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                            borderColor: 'var(--slds-g-color-border-base-1)'
                                                        }}
                                                        placeholder="Youth's thoughts on this goal"
                                                    />
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex justify-end gap-2 pt-2" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                    <Button
                                                        onClick={handleCancelEditGoal}
                                                        className="h-9 px-4 rounded-full text-[13px] font-medium"
                                                        style={{
                                                            backgroundColor: 'transparent',
                                                            color: '#706e6b',
                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={handleSaveGoal}
                                                        className="h-9 px-4 rounded-full text-[13px] font-medium"
                                                        style={{
                                                            backgroundColor: '#145F33',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        Save Goal
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Display Mode */
                                            <>
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2 flex-1">
                                                <h4 className="text-[13px] font-semibold text-[#080707]">
                                                    {parentGoal.goal}
                                                </h4>
                                                {parentGoal.badgeType && (
                                                    <Badge 
                                                        className="rounded text-[10px] px-2 py-0.5"
                                                        style={{
                                                            backgroundColor: '#FEF3C7',
                                                            color: '#92400E',
                                                            border: '1px solid #FDE68A',
                                                            fontWeight: 'normal'
                                                        }}
                                                    >
                                                        {parentGoal.badgeType}
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            {/* Action Icons */}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditGoal(parentGoal.id);
                                                    }}
                                                    className="p-1.5 rounded hover:bg-[#f3f2f2] transition-colors"
                                                    title="Edit Goal"
                                                >
                                                    <Pencil className="w-3.5 h-3.5 text-[#706e6b]" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleComments(parentGoal.id);
                                                    }}
                                                    className="p-1.5 rounded hover:bg-[#f3f2f2] transition-colors relative"
                                                    title="View Comments"
                                                >
                                                    <MessageSquare className="w-3.5 h-3.5 text-[#706e6b]" />
                                                    {parentGoal.comments && parentGoal.comments.length > 0 && (
                                                        <span className="absolute -top-1 -right-1 bg-[#145F33] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                                                            {parentGoal.comments.length}
                                                        </span>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteGoal(parentGoal.id);
                                                    }}
                                                    className="p-1.5 rounded hover:bg-[#f3f2f2] transition-colors"
                                                    title="Delete Goal"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-[#c23934]" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Progress Bar */}
                                        <div className="mb-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--slds-g-color-border-base-1)' }}>
                                                    <div 
                                                        className="h-full rounded-full transition-all duration-300"
                                                        style={{
                                                            width: `${parentGoal.progress}%`,
                                                            backgroundColor: parentGoal.progress === 100 ? '#145F33' : '#0176D3'
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[11px] text-[#706e6b] font-medium min-w-[35px] text-right">
                                                    {parentGoal.progress}%
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <>
                                                <div className="space-y-4 text-[11px] mt-4">
                                                    {/* Description */}
                                                    <div className="pb-3 border-b" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                        <span className="text-[#706e6b] font-medium text-[11px]">Description:</span>
                                                        <p className="text-[#080707] mt-2 leading-relaxed text-[11px]">{parentGoal.description}</p>
                                                    </div>
                                                    
                                                    {/* Enrollee, Point Person, Outcome Domain */}
                                                    <div className="grid grid-cols-3 gap-4 pb-3 border-b" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                        <div>
                                                            <span className="text-[#706e6b] font-medium text-[11px]">Enrollee:</span>
                                                            <p className="text-[#080707] mt-1.5 text-[11px]">{parentGoal.enrollee}</p>
                                                        </div>
                                                        {parentGoal.pointPersonName && (
                                                            <div>
                                                                <span className="text-[#706e6b] font-medium text-[11px]">Point Person:</span>
                                                                <p className="text-[#080707] mt-1.5 text-[11px]">{parentGoal.pointPersonName}</p>
                                                            </div>
                                                        )}
                                                        {parentGoal.outcomeDomain && (
                                                            <div>
                                                                <span className="text-[#706e6b] font-medium text-[11px]">Outcome Domain:</span>
                                                                <p className="text-[#080707] mt-1.5 text-[11px]">{parentGoal.outcomeDomain}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {parentGoal.reasonForGoal && (
                                                        <div className="pb-3 border-b" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                            <span className="text-[#706e6b] font-medium text-[11px]">Reason for Goal:</span>
                                                            <p className="text-[#080707] mt-2 leading-relaxed text-[11px]">{parentGoal.reasonForGoal}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {parentGoal.youthNotes && (
                                                        <div className="pb-3 border-b" style={{ borderColor: 'var(--slds-g-color-border-base-1)' }}>
                                                            <span className="text-[#706e6b] font-medium text-[11px]">Youth Notes:</span>
                                                            <p className="text-[#080707] mt-2 leading-relaxed italic text-[11px]">{parentGoal.youthNotes}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {(parentGoal.startDate || parentGoal.targetEndDate) && (
                                                        <div className="grid grid-cols-3 gap-4">
                                                            {parentGoal.startDate && (
                                                                <div>
                                                                    <span className="text-[#706e6b] font-medium text-[11px]">Start Date:</span>
                                                                    <p className="text-[#080707] mt-1.5 text-[11px]">{parentGoal.startDate}</p>
                                                                </div>
                                                            )}
                                                            {parentGoal.targetEndDate && (
                                                                <div>
                                                                    <span className="text-[#706e6b] font-medium text-[11px]">Target End:</span>
                                                                    <p className="text-[#080707] mt-1.5 text-[11px]">{parentGoal.targetEndDate}</p>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <span className="text-[#706e6b] font-medium text-[11px]">Status:</span>
                                                                <p className="text-[#080707] mt-1.5 text-[11px]">{parentGoal.status}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Comments Section */}
                                                {expandedComments.includes(parentGoal.id) && (
                                                    <div 
                                                        className="mt-4 p-3 rounded"
                                                        style={{
                                                            backgroundColor: '#fafaf9',
                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h5 className="text-[11px] font-semibold text-[#080707]">
                                                                Comments ({parentGoal.comments?.length || 0})
                                                            </h5>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setShowCommentForm(showCommentForm === parentGoal.id ? null : parentGoal.id);
                                                                }}
                                                                className="text-[11px] text-[#145F33] hover:underline"
                                                            >
                                                                Add Comment
                                                            </button>
                                                        </div>
                                                        
                                                        {/* Add Comment Form */}
                                                        {showCommentForm === parentGoal.id && (
                                                            <div className="mb-3 space-y-2">
                                                                <Textarea
                                                                    value={newComment}
                                                                    onChange={(e) => setNewComment(e.target.value)}
                                                                    placeholder="Add a comment..."
                                                                    className="text-[12px] rounded resize-none min-h-[60px]"
                                                                    style={{
                                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                                <div className="flex justify-end gap-2">
                                                                    <Button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setShowCommentForm(null);
                                                                            setNewComment("");
                                                                        }}
                                                                        className="h-7 px-3 rounded-full text-[11px]"
                                                                        style={{
                                                                            backgroundColor: 'transparent',
                                                                            color: '#706e6b',
                                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                                        }}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                    <Button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleAddComment(parentGoal.id);
                                                                        }}
                                                                        className="h-7 px-3 rounded-full text-[11px]"
                                                                        style={{
                                                                            backgroundColor: '#145F33',
                                                                            color: 'white'
                                                                        }}
                                                                    >
                                                                        Post
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Comments List */}
                                                        <div className="space-y-2">
                                                            {parentGoal.comments && parentGoal.comments.length > 0 ? (
                                                                parentGoal.comments.map((comment) => (
                                                                    <div 
                                                                        key={comment.id}
                                                                        className="p-2 rounded"
                                                                        style={{
                                                                            backgroundColor: 'var(--slds-g-color-background-base)',
                                                                            border: '1px solid var(--slds-g-color-border-base-1)'
                                                                        }}
                                                                    >
                                                                        <div className="flex items-start justify-between mb-1">
                                                                            <span className="text-[11px] font-semibold text-[#080707]">{comment.author}</span>
                                                                            <span className="text-[10px] text-[#706e6b]">{comment.date} at {comment.time}</span>
                                                                        </div>
                                                                        <p className="text-[11px] text-[#080707]">{comment.text}</p>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-[11px] text-[#706e6b] italic">No comments yet</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Child Goals */}
                            {isExpanded && childGoals.length > 0 && (
                                <div 
                                    className="px-5 pb-5 pt-0"
                                    style={{
                                        borderTop: '1px solid var(--slds-g-color-border-base-1)',
                                        backgroundColor: '#fafaf9'
                                    }}
                                >
                                    <div className="pt-5">
                                        <h5 className="text-[11px] font-semibold text-[#080707] mb-4">
                                            Intermediate Goal Definitions ({childGoals.length})
                                        </h5>
                                        
                                        <div className="space-y-3">
                                            {childGoals.map((childGoal) => (
                                                <div 
                                                    key={childGoal.id}
                                                    className="p-4 rounded"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                    }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            {editingGoalId === childGoal.id ? (
                                                                /* Edit Form for Child Goal */
                                                                <div className="space-y-3">
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px] font-semibold text-[#080707]">Goal Title *</Label>
                                                                        <Input
                                                                            value={editGoalData.goal}
                                                                            onChange={(e) => setEditGoalData({...editGoalData, goal: e.target.value})}
                                                                            className="h-8 text-[12px] rounded"
                                                                            style={{
                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                            }}
                                                                            placeholder="Enter goal title"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px] font-semibold text-[#080707]">Description</Label>
                                                                        <Textarea
                                                                            value={editGoalData.description}
                                                                            onChange={(e) => setEditGoalData({...editGoalData, description: e.target.value})}
                                                                            className="min-h-[60px] text-[12px] rounded resize-none"
                                                                            style={{
                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                            }}
                                                                            placeholder="Enter description..."
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1.5">
                                                                        <Label className="text-[11px] font-semibold text-[#080707]">Progress (%)</Label>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            value={editGoalData.progress}
                                                                            onChange={(e) => setEditGoalData({...editGoalData, progress: parseInt(e.target.value) || 0})}
                                                                            className="h-8 text-[12px] rounded"
                                                                            style={{
                                                                                backgroundColor: 'var(--slds-g-color-background-base)',
                                                                                borderColor: 'var(--slds-g-color-border-base-1)'
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <div className="flex justify-end gap-2 pt-2" style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}>
                                                                        <Button
                                                                            onClick={handleCancelEditGoal}
                                                                            className="h-8 px-3 rounded-full text-[11px] font-medium"
                                                                            style={{
                                                                                backgroundColor: 'transparent',
                                                                                color: '#706e6b',
                                                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                                                            }}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                        <Button
                                                                            onClick={handleSaveGoal}
                                                                            className="h-8 px-3 rounded-full text-[11px] font-medium"
                                                                            style={{
                                                                                backgroundColor: '#145F33',
                                                                                color: 'white'
                                                                            }}
                                                                        >
                                                                            Save Goal
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                /* Display Mode for Child Goal */
                                                                <>
                                                            <div className="text-[12px] text-[#080707] mb-1 font-medium">{childGoal.goal}</div>
                                                            <div className="text-[11px] text-[#706e6b] mb-2">{childGoal.description}</div>
                                                            
                                                            {/* Progress Bar */}
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--slds-g-color-border-base-1)' }}>
                                                                    <div 
                                                                        className="h-full rounded-full transition-all duration-300"
                                                                        style={{
                                                                            width: `${childGoal.progress}%`,
                                                                            backgroundColor: childGoal.progress === 100 ? '#145F33' : '#0176D3'
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] font-semibold text-[#706e6b] min-w-[32px] text-right">
                                                                    {childGoal.progress}%
                                                                </span>
                                                            </div>
                                                                </>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Action Buttons */}
                                                        {editingGoalId !== childGoal.id && (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleEditGoal(childGoal.id)}
                                                                className="p-1.5 rounded hover:bg-[#f3f2f2] transition-colors"
                                                                title="Edit Goal"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5 text-[#706e6b]" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setNewGoal({
                                                                        goal: '',
                                                                        description: '',
                                                                        status: 'Not Started',
                                                                        enrollee: 'Marcus Thompson',
                                                                        category: 'Intermediate Goal',
                                                                        progress: 0,
                                                                        targetDate: '',
                                                                        youthNotes: '',
                                                                        parentId: parentGoal.id,
                                                                        badgeType: '',
                                                                        enrolleeCount: 0
                                                                    });
                                                                    setShowAddGoal(parentGoal.id);
                                                                }}
                                                                className="text-[11px] text-[#0176d3] hover:text-[#014486] flex items-center gap-1"
                                                            >
                                                                <Plus className="w-3.5 h-3.5" />
                                                                Add
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteGoal(childGoal.id)}
                                                                className="p-1.5 rounded hover:bg-[#f3f2f2] transition-colors"
                                                                title="Delete Goal"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 text-[#c23934]" />
                                                            </button>
                                                        </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {/* Add Sub-Goal Form */}
                                            {showAddGoal === parentGoal.id && (
                                                <div 
                                                    className="mt-2 p-4 rounded space-y-3"
                                                    style={{
                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                        border: '1px solid var(--slds-g-color-border-base-1)'
                                                    }}
                                                >
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[11px] font-medium text-[#080707]">Goal Title</Label>
                                                                <Input
                                                                    value={newGoal.goal}
                                                                    onChange={(e) => setNewGoal({...newGoal, goal: e.target.value})}
                                                                    className="h-8 text-[13px] rounded"
                                                                    style={{
                                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                                    }}
                                                                    placeholder="Enter goal title"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <Label className="text-[11px] font-medium text-[#080707]">Enrollee</Label>
                                                                <Input
                                                                    value={newGoal.enrollee}
                                                                    onChange={(e) => setNewGoal({...newGoal, enrollee: e.target.value})}
                                                                    className="h-8 text-[13px] rounded"
                                                                    style={{
                                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                                    }}
                                                                    placeholder="Youth name"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5 md:col-span-2">
                                                                <Label className="text-[11px] font-medium text-[#080707]">Description</Label>
                                                                <Textarea
                                                                    value={newGoal.description}
                                                                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                                                                    className="text-[13px] rounded min-h-[60px] resize-none"
                                                                    style={{
                                                                        backgroundColor: 'var(--slds-g-color-background-base)',
                                                                        borderColor: 'var(--slds-g-color-border-base-1)'
                                                                    }}
                                                                    placeholder="Enter detailed goal description"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            onClick={() => setShowAddGoal(null)}
                                                            className="h-8 px-3 rounded-full text-[13px]"
                                                            style={{
                                                                backgroundColor: 'transparent',
                                                                color: '#706e6b',
                                                                border: '1px solid var(--slds-g-color-border-base-1)'
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            onClick={handleAddGoal}
                                                            className="h-8 px-3 rounded-full text-[13px]"
                                                            style={{
                                                                backgroundColor: '#145F33',
                                                                color: 'white'
                                                            }}
                                                        >
                                                            Add Goal
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
