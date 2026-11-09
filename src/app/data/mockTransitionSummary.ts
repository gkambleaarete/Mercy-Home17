// Dummy data for the Constituent Detail "Transition Summary" tab
// (TransitionSummarySection.tsx). Kept in one typed object so it can later be
// replaced with real constituent/Salesforce data without touching the UI.

/** "Ready for Review" and "Reviewed" are used by External summaries only
 *  (US 20103 review workflow); Internal summaries use Draft / Finalized. */
export type TransitionSummaryStatus =
  "Draft" | "Ready for Review" | "Reviewed" | "Finalized";

export interface TransitionSummaryProgram {
  program: string;
  startDate: string;
  endDate: string;
}

export interface TransitionSummaryStaff {
  role: string;
  staffMember: string;
  startDate: string;
  endDate: string;
  /** Stable row id (rows added or modified in the editor; US 20103). */
  id?: string;
  /** Linked staff member's Constituent ID, when chosen from the selector. */
  constituentId?: number;
}

export interface TransitionSummaryNarrative {
  title: string;
  content: string;
}

export interface TransitionSummary {
  status: TransitionSummaryStatus;
  youthName: string;
  dateOfBirth: string;
  admissionDate: string;
  transitionDate: string;
  lengthOfStay: string;
  generatedDate: string;
  finalizedBy: string;
  finalizedDate: string;
  programHistory: TransitionSummaryProgram[];
  keyStaffHistory: TransitionSummaryStaff[];
  narratives: TransitionSummaryNarrative[];
}

export const MOCK_TRANSITION_SUMMARY: TransitionSummary = {
  status: "Finalized",
  youthName: "Emily Johnson",
  dateOfBirth: "04/18/2008",
  admissionDate: "08/12/2022",
  transitionDate: "09/30/2026",
  lengthOfStay: "4 years, 1 month",
  generatedDate: "09/15/2026",
  finalizedBy: "Maria Rodriguez",
  finalizedDate: "09/18/2026",
  programHistory: [
    {
      program: "Residential Program",
      startDate: "08/12/2022",
      endDate: "06/15/2024",
    },
    {
      program: "Independent Living",
      startDate: "06/16/2024",
      endDate: "03/01/2026",
    },
    {
      program: "Transitional Living",
      startDate: "03/02/2026",
      endDate: "09/30/2026",
    },
  ],
  keyStaffHistory: [
    {
      role: "Therapist",
      staffMember: "Emily Carter",
      startDate: "08/12/2022",
      endDate: "05/30/2024",
    },
    {
      role: "Therapist",
      staffMember: "Michael Brown",
      startDate: "06/01/2024",
      endDate: "09/30/2026",
    },
    {
      role: "Advocate",
      staffMember: "Sarah Johnson",
      startDate: "08/12/2022",
      endDate: "12/15/2025",
    },
    {
      role: "ECR Coordinator",
      staffMember: "David Wilson",
      startDate: "01/10/2026",
      endDate: "09/30/2026",
    },
  ],
  narratives: [
    {
      title: "PTP & Goals",
      content:
        "Across the youth's time in care, treatment planning initially focused on stabilization, school engagement, and establishing consistent support systems. Over subsequent plans, goals evolved toward independent living skills, emotional regulation, educational progress, and preparation for transition. Progress was documented across several planning periods, with increasing emphasis on self-management and community readiness.",
    },
    {
      title: "Advocate Commentary",
      content:
        "Advocate observations across the youth's placement noted a consistent trajectory of growth in interpersonal skills and self-advocacy. Early reports highlighted challenges with peer relationships and authority figures, while later documentation reflected meaningful improvements in communication, conflict resolution, and community engagement.",
    },
    {
      title: "Therapy Commentary",
      content:
        "Therapeutic engagement spanned multiple providers and modalities over the course of placement. Initial clinical focus addressed trauma processing and behavioral stabilization, transitioning over time to skill-building around emotional regulation, cognitive restructuring, and relapse prevention strategies.",
    },
    {
      title: "Mental Health Commentary",
      content:
        "Mental health records indicate initial diagnoses were addressed through consistent medication management and therapeutic intervention. Symptom severity decreased over time with notable improvement in mood stability and reduced crisis episodes in the final year of placement.",
    },
    {
      title: "School & Career Commentary",
      content:
        "Educational records show progression from credit recovery and attendance stabilization to enrollment in a GED program, completed in spring 2025. Career exploration included participation in a culinary arts vocational program and a part-time employment placement beginning in early 2026.",
    },
    {
      title: "Recommendations",
      content:
        "Based on the youth's progress and current functioning, continued outpatient therapy and vocational support are recommended post-transition. Community-based mentoring and periodic check-ins with the transition coordinator are advised for the first six months following discharge.",
    },
  ],
};