// Fictional demo Staff History (US 20130): MHBG Staff constituents and
// completed, dated Program title assignments for the built-in demo Programs.
// Applied once, additively, through the shared Program persistence
// (mockProgramsData.ts) — see applyDemoStaffSeed there. Every record here is
// historical, so current staffing and current medication access are
// unchanged. The staff constituents themselves live in mockConstituents.ts
// (ids 9201–9207).

import type {
  ProgramStaffAssignment,
  ProgramStaffTitleId,
} from "./programStaffAssignmentStore";

/** Marker stored in the persisted state once this seed has been applied. */
export const US20130_DEMO_SEED_ID =
  "us20130-staff-history-demo-v1";

const STAFF = {
  maya: 9201, // Maya Bennett
  ethan: 9202, // Ethan Parker
  sophia: 9203, // Sophia Collins
  noah: 9204, // Noah Reed
  olivia: 9205, // Olivia Brooks
  lucas: 9206, // Lucas Morgan
  amelia: 9207, // Amelia Foster
} as const;
type StaffKey = keyof typeof STAFF;

type Row = [
  programId: number,
  staff: StaffKey,
  title: ProgramStaffTitleId,
  start: string,
  end: string,
];

const PM = "program-manager";
const TH = "therapist";
const SU = "supervisor";
const ECR = "ecr-coordinator";
const DAY = "day-coordinator";
const YCW = "youth-care-worker";

const ROWS: Row[] = [
  // Bernardin (Program id 3)
  [3, "maya", PM, "2025-01-06", "2025-06-30"],
  [3, "ethan", PM, "2025-07-01", "2025-12-31"],
  [3, "sophia", TH, "2025-01-06", "2025-12-31"],
  [3, "noah", SU, "2025-01-06", "2025-12-31"],
  [3, "olivia", ECR, "2025-01-06", "2025-06-30"],
  [3, "olivia", DAY, "2025-07-01", "2025-12-31"],
  [3, "lucas", YCW, "2025-01-06", "2025-03-31"],
  [3, "lucas", YCW, "2025-09-01", "2025-12-31"],
  [3, "amelia", YCW, "2025-01-06", "2025-12-31"],
  // Self-Awareness (1) — operating since 2019-08-15
  [1, "ethan", PM, "2022-01-10", "2022-12-16"],
  [1, "sophia", TH, "2022-01-10", "2022-08-31"],
  [1, "noah", SU, "2022-09-01", "2023-06-30"],
  [1, "olivia", ECR, "2022-02-01", "2022-12-16"],
  [1, "maya", DAY, "2023-01-09", "2023-12-15"],
  [1, "lucas", YCW, "2022-03-01", "2022-11-30"],
  // A Program #2 (2) — operated 2022-01-10 to 2025-06-30
  [2, "maya", PM, "2022-02-01", "2023-06-30"],
  [2, "noah", TH, "2022-02-01", "2024-06-28"],
  [2, "sophia", SU, "2023-01-09", "2024-12-20"],
  [2, "amelia", ECR, "2022-03-01", "2023-03-31"],
  [2, "lucas", DAY, "2023-04-03", "2025-06-30"],
  [2, "olivia", YCW, "2022-02-01", "2024-01-31"],
  // Couderc (4) — operating since 2020-01-06
  [4, "lucas", PM, "2023-01-02", "2023-12-29"],
  [4, "amelia", TH, "2023-01-02", "2024-06-28"],
  [4, "maya", SU, "2023-03-01", "2024-02-29"],
  [4, "ethan", ECR, "2023-01-02", "2023-09-29"],
  [4, "sophia", DAY, "2023-10-02", "2024-12-20"],
  [4, "noah", YCW, "2023-02-01", "2024-07-31"],
  // Seton (5) — operating since 2021-03-01
  [5, "olivia", PM, "2022-01-03", "2022-12-30"],
  [5, "lucas", TH, "2022-01-03", "2023-05-31"],
  [5, "amelia", SU, "2022-06-01", "2023-06-30"],
  [5, "noah", ECR, "2022-01-03", "2022-12-30"],
  [5, "ethan", DAY, "2023-01-02", "2024-06-28"],
  [5, "maya", YCW, "2022-09-01", "2024-08-30"],
  // Bosco (6) — operating since 2023-08-21
  [6, "sophia", PM, "2023-09-01", "2024-06-28"],
  [6, "ethan", TH, "2023-09-01", "2024-08-30"],
  [6, "lucas", SU, "2024-07-01", "2025-06-30"],
  [6, "maya", ECR, "2023-09-01", "2024-03-29"],
  [6, "amelia", DAY, "2024-04-01", "2025-03-31"],
  [6, "olivia", YCW, "2023-10-02", "2025-01-31"],
  // Campbell (7) — operated 2019-05-01 to 2025-12-31
  [7, "noah", PM, "2022-01-03", "2023-06-30"],
  [7, "olivia", TH, "2022-01-03", "2024-12-20"],
  [7, "ethan", SU, "2023-07-03", "2025-12-31"],
  [7, "sophia", ECR, "2022-02-01", "2023-01-31"],
  [7, "amelia", DAY, "2023-02-01", "2024-01-31"],
  [7, "maya", YCW, "2022-03-01", "2025-06-30"],
  // Cooke (8) — operating since 2024-02-01
  [8, "amelia", PM, "2024-03-01", "2024-12-20"],
  [8, "maya", TH, "2024-03-01", "2025-06-30"],
  [8, "olivia", SU, "2024-03-01", "2025-03-31"],
  [8, "lucas", ECR, "2024-04-01", "2024-12-20"],
  [8, "noah", DAY, "2025-01-06", "2025-09-30"],
  [8, "ethan", YCW, "2024-03-01", "2025-10-31"],
];

const STAMP = "2025-01-01T00:00:00.000Z";

/** Stable ids: US20130-demo-<programId>-<n>. All completed (ongoing false). */
export const US20130_DEMO_ASSIGNMENTS: ProgramStaffAssignment[] =
  (() => {
    const counts = new Map<number, number>();
    return ROWS.map(
      ([programId, staff, titleId, startDate, endDate]) => {
        const n = (counts.get(programId) ?? 0) + 1;
        counts.set(programId, n);
        return {
          id: `US20130-demo-${programId}-${n}`,
          programId,
          constituentId: STAFF[staff],
          titleId,
          startDate,
          endDate,
          ongoing: false,
          notes: "",
          createdAt: STAMP,
          updatedAt: STAMP,
        };
      },
    );
  })();