// US 20185 — Program-specific Shift Handover Checklists (UI prototype).
//
// In-memory, session-only demo state: checklists are keyed by Program id and
// reset on page reload. There is no backend or persistence behind this — it
// only exists so the Program record (Chunk 1) and, later, the Create
// Handover popup can read the same Program-specific fixtures.

import { useSyncExternalStore } from "react";

export type ChecklistShift =
  | "Morning"
  | "Evening"
  | "Overnight"
  | "All Shifts";

export const CHECKLIST_SHIFT_OPTIONS: ChecklistShift[] = [
  "Morning",
  "Evening",
  "Overnight",
  "All Shifts",
];

export type ChecklistStatus = "Active" | "Inactive";

export const CHECKLIST_STATUS_OPTIONS: ChecklistStatus[] = [
  "Active",
  "Inactive",
];

export interface ChecklistItem {
  id: string;
  description: string;
}

export interface ShiftHandoverChecklist {
  id: string;
  programId: number | string;
  name: string;
  shift: ChecklistShift;
  status: ChecklistStatus;
  items: ChecklistItem[];
}

let idSeq = 0;
export function newChecklistId(prefix = "chk"): string {
  idSeq += 1;
  return `${prefix}-${Date.now().toString(36)}-${idSeq}`;
}

const items = (descriptions: string[], prefix: string) =>
  descriptions.map((description, i) => ({
    id: `${prefix}-item-${i + 1}`,
    description,
  }));

// Sample content supplied in US 20185 (Mahoney Home's checklist). It is
// attached ONLY to Program 1 (Self-Awareness) for the demo, so a long,
// populated checklist can be previewed without creating a new Program.
const MAHONEY_SAMPLE_ITEMS = [
  "All Ventra’s were collected and placed in the envelope on the corkboard.",
  "Program cleanliness was completed and documented in the Chore Binder.",
  "Youth Tracking sheets were erased for the next shift.",
  "Youth chore binders were completed for every youth.",
  "Drug screens were administered, Redwood was completed, toxicology forms were filed, and drops were entered into BP (if applicable).",
  "All youth phones and electronics were collected and placed in the staff office.",
  "Youth money request forms were completed and submitted to the Program Manager.",
  "Kitchen cleaned.",
  "Bathroom/stalls cleaned.",
  "Staff office cleaned.",
  "Front and back halls cleaned.",
  "Milieu cleaned.",
  "Study area cleaned and headsets returned to the staff office.",
  "Laundry room locked, and clothes returned to youth or placed in the dryer.",
];

let checklists: ShiftHandoverChecklist[] = [
  // Program 1 — Self-Awareness: hosts the Mahoney Home sample content.
  {
    id: "chk-p1-handover",
    programId: 1,
    name: "Shift Handover Checklist",
    shift: "All Shifts",
    status: "Active",
    items: items(MAHONEY_SAMPLE_ITEMS, "chk-p1-handover"),
  },
  {
    id: "chk-p1-morning",
    programId: 1,
    name: "Morning Wake-Up & School Departure",
    shift: "Morning",
    status: "Inactive",
    items: items(
      [
        "All youth woken up and accounted for by 6:30 AM.",
        "Morning medications administered and logged on the MAR.",
        "Breakfast served and kitchen wiped down.",
        "School bags, IDs, and bus passes checked before departure.",
        "Departure times recorded on the Youth Tracking sheet.",
      ],
      "chk-p1-morning",
    ),
  },
  // Program 2 — A Program #2
  {
    id: "chk-p2-all",
    programId: 2,
    name: "General Shift Handover",
    shift: "All Shifts",
    status: "Active",
    items: items(
      [
        "Youth headcount confirmed.",
        "Incidents from this shift documented.",
        "Staff office keys returned to the lockbox.",
      ],
      "chk-p2-all",
    ),
  },
  // Program 3 — Bernardin: shift-specific + an inactive checklist, to show
  // both status badges and shift filtering.
  {
    id: "chk-p3-evening",
    programId: 3,
    name: "Evening Wind-Down Checklist",
    shift: "Evening",
    status: "Active",
    items: items(
      [
        "Youth headcount confirmed and recorded on the tracking sheet.",
        "Kitchen cleaned and locked.",
        "Youth phones and electronics collected and placed in the staff office.",
      ],
      "chk-p3-evening",
    ),
  },
  {
    id: "chk-p3-legacy",
    programId: 3,
    name: "Overnight Security Walkthrough (Previous Version)",
    shift: "Overnight",
    status: "Inactive",
    items: items(
      [
        "Exterior doors checked and locked.",
        "Hallway lights set to night mode.",
      ],
      "chk-p3-legacy",
    ),
  },
  // Every other Program starts empty (empty state).
];

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getChecklists(): ShiftHandoverChecklist[] {
  return checklists;
}

export function getProgramChecklists(
  programId: number | string,
): ShiftHandoverChecklist[] {
  return checklists.filter((c) => c.programId === programId);
}

/** Insert or replace by id. */
export function saveChecklist(checklist: ShiftHandoverChecklist) {
  const exists = checklists.some((c) => c.id === checklist.id);
  checklists = exists
    ? checklists.map((c) => (c.id === checklist.id ? checklist : c))
    : [...checklists, checklist];
  emit();
}

export function setChecklistStatus(
  id: string,
  status: ChecklistStatus,
) {
  checklists = checklists.map((c) =>
    c.id === id ? { ...c, status } : c,
  );
  emit();
}

export function deleteChecklist(id: string) {
  checklists = checklists.filter((c) => c.id !== id);
  emit();
}

export function useProgramChecklists(
  programId: number | string,
): ShiftHandoverChecklist[] {
  const all = useSyncExternalStore(subscribe, getChecklists);
  return all.filter((c) => c.programId === programId);
}

/** Active checklists for a Program that apply to the given shift
 *  ("All Shifts" applies to every shift). */
export function applicableChecklists(
  list: ShiftHandoverChecklist[],
  shift: ChecklistShift,
): ShiftHandoverChecklist[] {
  return list.filter(
    (c) =>
      c.status === "Active" &&
      (c.shift === "All Shifts" || c.shift === shift),
  );
}

/** Create Handover's shift values → checklist shift names. */
export function handoverShiftToChecklistShift(
  value: string,
): ChecklistShift {
  if (value === "afternoon") return "Evening";
  if (value === "night") return "Overnight";
  return "Morning";
}

// ── Create Handover draft (Chunk 2) ──────────────────────────────────────
export interface ChecklistItemResponse {
  checked: boolean;
  notes: string;
}

export interface HandoverChecklistDraft {
  /** "" = nothing chosen yet, "none" = No checklist, else checklist id. */
  checklistId: string;
  responses: Record<string, ChecklistItemResponse>;
  /** Editing a saved handover: the checklist exactly as recorded, used
   *  instead of the current configuration (which may have been renamed,
   *  reordered or deactivated since). */
  snapshot?: ShiftHandoverChecklist;
}

export const EMPTY_HANDOVER_CHECKLIST_DRAFT: HandoverChecklistDraft = {
  checklistId: "",
  responses: {},
};

export function draftHasResponses(d: HandoverChecklistDraft): boolean {
  return Object.values(d.responses).some(
    (r) => r.checked || r.notes.trim() !== "",
  );
}

export type ChecklistCompletionStatus =
  | "Not started"
  | "In progress"
  | "Complete";

export function completionStatus(
  done: number,
  total: number,
): ChecklistCompletionStatus {
  if (done === 0) return "Not started";
  if (done >= total) return "Complete";
  return "In progress";
}

// ── Chunk 3: saved results + summary composition ─────────────────────────

/** A handover's checklist results, frozen at save time (session only). */
export interface SavedChecklistResult {
  checklistId: string;
  name: string;
  shift: ChecklistShift;
  items: { id: string; description: string; checked: boolean; notes: string }[];
  completed: number;
  total: number;
  status: ChecklistCompletionStatus;
}

export function buildChecklistResult(
  checklist: ShiftHandoverChecklist,
  draft: HandoverChecklistDraft,
): SavedChecklistResult {
  const items = checklist.items.map((i) => ({
    id: i.id,
    description: i.description,
    checked: !!draft.responses[i.id]?.checked,
    notes: (draft.responses[i.id]?.notes ?? "").trim(),
  }));
  const completed = items.filter((i) => i.checked).length;
  return {
    checklistId: checklist.id,
    name: checklist.name,
    shift: checklist.shift,
    items,
    completed,
    total: items.length,
    status: completionStatus(completed, items.length),
  };
}

/** Plain-text checklist block — the only place this wording is built, so
 *  regenerating can never duplicate it. */
export function composeChecklistBlock(r: SavedChecklistResult): string {
  const lines = [
    `Checklist: ${r.name}`,
    `Completion: ${r.completed} of ${r.total} completed | ${r.status}`,
    "",
  ];
  r.items.forEach((i, n) => {
    lines.push(
      `${n + 1}. ${i.checked ? "Completed" : "Incomplete"}: ${i.description}`,
    );
    if (i.notes) lines.push(`   Notes: ${i.notes}`);
  });
  return lines.join("\n");
}

export const SUMMARY_CHECKLIST_DIVIDER = "──────── CHECKLIST RESULTS ────────";

/** Saved summary = staff narrative + (divider + checklist block). */
export function composeHandoverSummary(
  narrative: string,
  result: SavedChecklistResult | null,
): string {
  const text = narrative.trim();
  if (!result) return text;
  const block = composeChecklistBlock(result);
  return text
    ? `${text}\n\n${SUMMARY_CHECKLIST_DIVIDER}\n${block}`
    : `${SUMMARY_CHECKLIST_DIVIDER}\n${block}`;
}

/** Rebuild an editable draft from a saved result (Edit Handover). */
export function draftFromSavedResult(
  r: SavedChecklistResult,
  programId: number | string,
): HandoverChecklistDraft {
  const responses: Record<string, ChecklistItemResponse> = {};
  r.items.forEach((i) => {
    responses[i.id] = { checked: i.checked, notes: i.notes };
  });
  return {
    checklistId: r.checklistId,
    responses,
    snapshot: {
      id: r.checklistId,
      programId,
      name: r.name,
      shift: r.shift,
      status: "Active",
      items: r.items.map((i) => ({ id: i.id, description: i.description })),
    },
  };
}

/** Display-only shift names (US 20185): stored values keep the older
 *  "Afternoon"/"Night" wording; staff see Evening/Overnight. */
export function displayShiftLabel(shift: string): string {
  return shift
    .replace(/^Afternoon\b/, "Evening")
    .replace(/^Night\b/, "Overnight");
}
