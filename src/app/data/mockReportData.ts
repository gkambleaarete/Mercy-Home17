// Sample (demo) data for the Reports module. Every report renders as a PDF
// built from one of these tables. Values are fictional and deterministic.

export interface ReportTable {
  columns: string[]
  rows: string[][]
}

const YOUTH = [
  "Emily Johnson",
  "Patricia Lee",
  "Marcus Reed",
  "Aiden Torres",
  "Hannah Kim",
  "Brianna Wells",
  "Jordan Chen",
  "Sofia Ramirez",
]
const PROGRAMS = [
  "Self-Awareness",
  "Bernardin",
  "Mahoney House",
  "Walsh Campus",
]
const MEDS: [string, string][] = [
  ["Adderall XR", "20mg"],
  ["Zoloft", "50mg"],
  ["Melatonin", "5mg"],
  ["Lexapro", "10mg"],
  ["Clonidine", "0.1mg"],
  ["Abilify", "5mg"],
  ["Vitamin D", "1000 IU"],
  ["Concerta", "36mg"],
]
const PERIODS = ["Morning", "Afternoon", "Bedtime"]
const STAFF = [
  "Sarah Johnson",
  "Michael Chen",
  "Lisa Martinez",
  "Maria Santos",
  "David Reyes",
]
const PHYSICIANS = ["Dr. Alan Brooks", "Dr. Nina Patel", "Dr. Omar Haddad"]

const day = (d: number) => `10/${String(d).padStart(2, "0")}/2026`
const pick = <T>(a: T[], i: number) => a[i % a.length]
const rows = (n: number, f: (i: number) => string[]) =>
  Array.from({ length: n }, (_, i) => f(i))

export const REPORT_DATA: Record<string, ReportTable> = {
  // ── Constituent Reports
  "DCFS Audit": {
    columns: [
      "Youth",
      "Program",
      "DCFS Case #",
      "Last Audit",
      "Findings",
      "Status",
    ],
    rows: rows(10, (i) => [
      pick(YOUTH, i),
      pick(PROGRAMS, i),
      `DCFS-${24310 + i * 7}`,
      day(3 + i * 2),
      pick(["None", "Missing signature", "Late visit note", "None"], i),
      pick(["Compliant", "Follow-up", "Compliant", "Compliant"], i),
    ]),
  },
  "CPI Eligibility": {
    columns: [
      "Youth",
      "Program",
      "Assessment Date",
      "Score",
      "Eligible",
      "Reviewer",
    ],
    rows: rows(9, (i) => [
      pick(YOUTH, i),
      pick(PROGRAMS, i),
      day(1 + i * 3),
      String(62 + ((i * 7) % 30)),
      62 + ((i * 7) % 30) >= 70 ? "Yes" : "No",
      pick(STAFF, i),
    ]),
  },
  // ── Medication Reports
  "Medication Overview": {
    columns: [
      "Youth",
      "Program",
      "Medication",
      "Dose",
      "Dosing Period",
      "Psychotropic",
    ],
    rows: rows(12, (i) => [
      pick(YOUTH, i),
      pick(PROGRAMS, i),
      pick(MEDS, i)[0],
      pick(MEDS, i)[1],
      pick(PERIODS, i),
      pick(["Yes", "Yes", "No", "Yes", "No", "Yes", "No", "Yes"], i),
    ]),
  },
  "Medication Last Counts": {
    columns: [
      "Youth",
      "Medication",
      "Dose",
      "Last Count",
      "Count Date",
      "Counted By",
    ],
    rows: rows(10, (i) => [
      pick(YOUTH, i),
      pick(MEDS, i)[0],
      pick(MEDS, i)[1],
      String(8 + ((i * 5) % 40)),
      day(20 + (i % 8)),
      pick(STAFF, i),
    ]),
  },
  "Medication Review by Youth Physician": {
    columns: [
      "Physician",
      "Youth",
      "Medication",
      "Review Date",
      "Outcome",
      "Next Review",
    ],
    rows: rows(9, (i) => [
      pick(PHYSICIANS, i),
      pick(YOUTH, i),
      pick(MEDS, i)[0],
      day(2 + i * 3),
      pick(["Continue", "Adjust dose", "Continue", "Discontinue"], i),
      `11/${String(2 + i * 3).padStart(2, "0")}/2026`,
    ]),
  },
  "Medication Assigned Documentation Errors": {
    columns: [
      "Dosing Date",
      "Youth",
      "Medication",
      "Error Type",
      "Assignee",
      "Status",
    ],
    rows: rows(10, (i) => [
      day(12 + i),
      pick(YOUTH, i),
      pick(MEDS, i)[0],
      pick(
        ["Missing attestation", "Wrong period", "Count mismatch", "Late entry"],
        i,
      ),
      pick(STAFF, i + 2),
      pick(["Assigned", "Updated", "Resolved"], i),
    ]),
  },
  "Medical Summary Report": {
    columns: [
      "Youth",
      "Program",
      "Allergies",
      "Active Meds",
      "Last Physical",
      "Physician",
    ],
    rows: rows(8, (i) => [
      pick(YOUTH, i),
      pick(PROGRAMS, i),
      pick(["None", "Penicillin", "Peanuts", "None", "Latex"], i),
      String(1 + (i % 4)),
      `0${1 + (i % 9)}/15/2026`,
      pick(PHYSICIANS, i),
    ]),
  },
  // ── Occupancy Reports
  "Pop Sheet": {
    columns: [
      "Program",
      "Capacity",
      "Current",
      "Available",
      "Out on Pass",
      "Date",
    ],
    rows: PROGRAMS.map((p, i) => {
      const cap = 12 + i * 2,
        cur = cap - 1 - (i % 3)
      return [
        p,
        String(cap),
        String(cur),
        String(cap - cur),
        String(i % 2),
        "11/05/2026",
      ]
    }),
  },
  "Occupancy Rate Detail Report": {
    columns: ["Date", "Program", "Capacity", "Occupied", "Occupancy %"],
    rows: rows(12, (i) => {
      const cap = 12 + (i % 4) * 2,
        occ = cap - (i % 3)
      return [
        day(20 + (i % 10)),
        pick(PROGRAMS, i),
        String(cap),
        String(occ),
        `${Math.round((occ / cap) * 100)}%`,
      ]
    }),
  },
  "Occupancy Rate Summary Report": {
    columns: [
      "Program",
      "Avg Capacity",
      "Avg Occupied",
      "Occupancy %",
      "Period",
    ],
    rows: PROGRAMS.map((p, i) => {
      const cap = 12 + i * 2,
        occ = cap - 1.4 + i * 0.2
      return [
        p,
        String(cap),
        occ.toFixed(1),
        `${Math.round((occ / cap) * 100)}%`,
        "Oct 2026",
      ]
    }),
  },
  "Youth Admitted": {
    columns: [
      "Youth",
      "Program",
      "Admission Date",
      "Referral Source",
      "Case Worker",
    ],
    rows: rows(8, (i) => [
      pick(YOUTH, i + 3),
      pick(PROGRAMS, i),
      day(1 + i * 3),
      pick(["DCFS", "Family", "School", "Court"], i),
      pick(STAFF, i),
    ]),
  },
  "Youth Discharged": {
    columns: [
      "Youth",
      "Program",
      "Discharge Date",
      "Length of Stay",
      "Discharge Reason",
    ],
    rows: rows(6, (i) => [
      pick(YOUTH, i + 1),
      pick(PROGRAMS, i),
      day(4 + i * 4),
      `${90 + i * 37} days`,
      pick(["Reunification", "Aged out", "Transfer", "Independent living"], i),
    ]),
  },
  // ── Program Reports
  "Incident Summary": {
    columns: [
      "Date",
      "Program",
      "Youth",
      "Incident Type",
      "Severity",
      "Reported By",
    ],
    rows: rows(10, (i) => [
      day(2 + i * 2),
      pick(PROGRAMS, i),
      pick(YOUTH, i),
      pick(["Behavioral", "Medical", "Property", "AWOL"], i),
      pick(["Low", "Medium", "Low", "High"], i),
      pick(STAFF, i),
    ]),
  },
  "Home Visits Report": {
    columns: [
      "Youth",
      "Program",
      "Visit Date",
      "Destination",
      "Return",
      "Outcome",
    ],
    rows: rows(9, (i) => [
      pick(YOUTH, i),
      pick(PROGRAMS, i),
      day(3 + i * 3),
      pick(["Parent", "Grandparent", "Aunt"], i),
      day(5 + i * 3),
      pick(["Positive", "Positive", "Concerns noted"], i),
    ]),
  },
  // ── Admissions Reports
  "Open Admissions Cases Report": {
    columns: [
      "Case #",
      "Applicant",
      "Referral Date",
      "Stage",
      "Program Requested",
      "Assigned To",
    ],
    rows: rows(9, (i) => [
      `ADM-${3101 + i}`,
      pick(
        ["Liam Foster", "Ava Brooks", "Noah Diaz", "Mia Patel", "Ethan Ross"],
        i,
      ),
      day(1 + i * 3),
      pick(["Screening", "Interview", "Determination", "Awaiting Docs"], i),
      pick(PROGRAMS, i),
      pick(STAFF, i),
    ]),
  },
  "Youth Information Overview Report": {
    columns: [
      "Youth",
      "Age",
      "Program",
      "Admission Date",
      "School",
      "Case Worker",
    ],
    rows: rows(8, (i) => [
      pick(YOUTH, i),
      String(13 + (i % 5)),
      pick(PROGRAMS, i),
      `0${1 + (i % 9)}/10/2026`,
      pick(["Mercy Academy", "Lincoln High", "Kelly Middle"], i),
      pick(STAFF, i),
    ]),
  },
  "Youth Medical, Physical & Dietary Needs": {
    columns: [
      "Youth",
      "Medical Needs",
      "Physical Needs",
      "Dietary Needs",
      "Program",
    ],
    rows: rows(8, (i) => [
      pick(YOUTH, i),
      pick(["Asthma", "None", "ADHD", "Diabetes (Type 1)"], i),
      pick(["None", "Glasses", "None", "Knee brace"], i),
      pick(["Nut-free", "None", "Vegetarian", "Low sugar", "Lactose-free"], i),
      pick(PROGRAMS, i),
    ]),
  },
}
