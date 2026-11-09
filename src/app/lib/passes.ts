// Pass business rules (19998, Chunks 2A–2B) — pure functions, no UI, so the
// form, and later the List/Calendar/automation, share one definition.
// Same convention as lib/projectionsWaitlist.ts.

import { isoToMdy, mdyToIso } from "./dateFormat";
import { isCompletePhone } from "./phone";
import { isValidMdy } from "../data/mockProgramsData";
import { getPackMedById } from "../data/mockPackMedData";
import {
  type PassHistoryEntry,
  type PassRecord,
  type PassRecurrence,
  type PassStatus,
  type PassTrackedField,
  type TransportMethod,
  type Weekday,
  WEEKDAYS,
} from "../data/mockPassData";
import {
  type ContactAddress,
  getYouthName,
  getPassEligibleRelationships,
  getYouthAddresses,
} from "../data/mockYouthProgramData";

/** Sentinel select value for the "Other" choice in Who / Where. */
export const PASS_OTHER = "other";

/** The editable draft the Pass form works with. Dates are "MM/DD/YYYY"
 *  (DateInput), times "h:mm AM/PM" (TimeInput). Select values:
 *  - stayingWith: a YouthRelationship.constituentId, PASS_OTHER, or ""
 *  - stayingAt:   "youth:<addressId>" | "constituent:<addressId>" |
 *                 PASS_OTHER | "" */
export interface PassFormValues {
  youthId: string;
  programId: string;
  status: PassStatus;
  startDate: string;
  departureTime: string;
  endDate: string;
  returnTime: string;
  stayingWith: string;
  otherName: string;
  phone: string;
  stayingAt: string;
  otherAddress: string;
  departureMethod: TransportMethod | "";
  returnMethod: TransportMethod | "";
  transportationDetails: string;
  noteworthyDetails: string;
  // Status = Cancelled
  cancellationReason: string;
  // Status = Shortened / Extended
  actualReturnDate: string;
  actualReturnTime: string;
  changeReason: string;
  // Pack Med link (20042) — a PackMedRecord.id or "". Applied through
  // lib/passPackMedAssociation.ts after save, never copied by formToPassFields.
  packMedId: string;
  // Recurrence (create only)
  repeats: boolean;
  repeatEvery: string;
  departureDay: Weekday | "";
  returnDay: Weekday | "";
  ends: "onDate" | "afterCount" | "";
  endsOnDate: string;
  numberOfPasses: string;
}

export type PassFormErrors = Partial<
  Record<keyof PassFormValues, string>
>;

export function emptyPassForm(): PassFormValues {
  return {
    youthId: "",
    programId: "",
    status: "Pending",
    startDate: "",
    departureTime: "",
    endDate: "",
    returnTime: "",
    stayingWith: "",
    otherName: "",
    phone: "",
    stayingAt: "",
    otherAddress: "",
    departureMethod: "",
    returnMethod: "",
    transportationDetails: "",
    noteworthyDetails: "",
    cancellationReason: "",
    actualReturnDate: "",
    actualReturnTime: "",
    changeReason: "",
    packMedId: "",
    repeats: false,
    repeatEvery: "",
    departureDay: "",
    returnDay: "",
    ends: "",
    endsOnDate: "",
    numberOfPasses: "",
  };
}

/** Create-form values for "Copy" of an existing Pass: carries Program,
 *  Youth, who/where they're staying (with phone) and Transportation only.
 *  Dates, times, Noteworthy Details and every status/system field start
 *  blank, and Status is Pending (the create default). */
export function copyPassToForm(p: PassRecord): PassFormValues {
  const source = passToForm(p);
  return {
    ...emptyPassForm(),
    programId: source.programId,
    youthId: source.youthId,
    stayingWith: source.stayingWith,
    otherName: source.otherName,
    phone: source.phone,
    stayingAt: source.stayingAt,
    otherAddress: source.otherAddress,
    departureMethod: source.departureMethod,
    returnMethod: source.returnMethod,
    transportationDetails: source.transportationDetails,
  };
}

export function passToForm(p: PassRecord): PassFormValues {
  return {
    youthId: p.youthId,
    programId: String(p.programId),
    status: p.status,
    startDate: isoToMdy(p.startDate),
    departureTime: p.departureTime,
    endDate: isoToMdy(p.endDate),
    returnTime: p.returnTime,
    stayingWith:
      p.stayingWithType === "other"
        ? PASS_OTHER
        : (p.stayingWithConstituentId ?? ""),
    otherName:
      p.stayingWithType === "other" ? p.stayingWithName : "",
    phone: p.phone,
    stayingAt:
      p.stayingAtType === "other"
        ? PASS_OTHER
        : `${p.stayingAtType}:${p.stayingAtAddressId ?? ""}`,
    otherAddress:
      p.stayingAtType === "other" ? p.stayingAtAddress : "",
    departureMethod: p.departureMethod,
    returnMethod: p.returnMethod,
    transportationDetails: p.transportationDetails,
    noteworthyDetails: p.noteworthyDetails,
    cancellationReason: p.cancellationReason ?? "",
    actualReturnDate: p.actualReturnDate
      ? isoToMdy(p.actualReturnDate)
      : "",
    actualReturnTime: p.actualReturnTime ?? "",
    changeReason: p.changeReason ?? "",
    packMedId: p.packMedId != null ? String(p.packMedId) : "",
    // Recurrence is fixed once generated; occurrences are edited individually.
    repeats: false,
    repeatEvery: "",
    departureDay: "",
    returnDay: "",
    ends: "",
    endsOnDate: "",
    numberOfPasses: "",
  };
}

export function isShortenedOrExtended(
  status: PassStatus,
): boolean {
  return status === "Shortened" || status === "Extended";
}

/** "h:mm AM/PM" → minutes after midnight, or null if not a valid time. */
export function timeToMinutes(t: string): number | null {
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(t.trim());
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2]);
}

/** "Pass - [First Name] [Last Name] [Start Date]" — youthName is the
 *  youth's full "First Last" display name; date shown MM/DD/YYYY. */
export function buildPassRecordName(
  youthName: string,
  startDateIso: string,
): string {
  return `Pass - ${youthName} ${isoToMdy(startDateIso)}`;
}

/** All Chunk 2A field rules. Returns an empty object when valid. */
export function validatePassForm(
  f: PassFormValues,
): PassFormErrors {
  const e: PassFormErrors = {};

  if (!f.youthId) e.youthId = "Youth is required.";
  if (!f.programId) e.programId = "Program is required.";
  // Pack Med (20042): must still exist and belong to this Pass's youth.
  if (f.packMedId) {
    const packMed = getPackMedById(Number(f.packMedId));
    if (!packMed)
      e.packMedId =
        "The selected Pack Med no longer exists. Choose another or None.";
    else if (packMed.youthId !== f.youthId)
      e.packMedId =
        "The selected Pack Med belongs to a different youth. Choose a Pack Med for this youth or None.";
  }
  if (!f.status) e.status = "Status is required.";

  if (!f.startDate.trim())
    e.startDate = "Start Date is required.";
  else if (!isValidMdy(f.startDate))
    e.startDate = "Enter a valid date (MM/DD/YYYY).";
  if (timeToMinutes(f.departureTime) === null)
    e.departureTime = "Departure Time is required.";
  if (!f.endDate.trim()) e.endDate = "End Date is required.";
  else if (!isValidMdy(f.endDate))
    e.endDate = "Enter a valid date (MM/DD/YYYY).";
  if (timeToMinutes(f.returnTime) === null)
    e.returnTime = "Return Time is required.";

  if (!e.startDate && !e.endDate) {
    const start = mdyToIso(f.startDate);
    const end = mdyToIso(f.endDate);
    if (end < start)
      e.endDate = "End Date cannot be before Start Date.";
    else if (
      end === start &&
      !e.departureTime &&
      !e.returnTime &&
      timeToMinutes(f.returnTime)! <
        timeToMinutes(f.departureTime)!
    )
      e.returnTime =
        "Return Time cannot be before Departure Time on the same day.";
  }

  if (!f.stayingWith)
    e.stayingWith =
      "Who the youth will be staying with is required.";
  else if (f.stayingWith === PASS_OTHER && !f.otherName.trim())
    e.otherName = "Name is required.";

  if (!f.phone.trim()) e.phone = "Phone is required.";
  else if (!isCompletePhone(f.phone))
    e.phone = "Enter a phone number as (xxx) xxx-xxxx.";

  if (!f.stayingAt)
    e.stayingAt =
      "Where the youth will be staying is required.";
  else if (f.stayingAt === PASS_OTHER && !f.otherAddress.trim())
    e.otherAddress = "Address is required.";

  if (!f.departureMethod)
    e.departureMethod = "Departure Method is required.";
  if (!f.returnMethod)
    e.returnMethod = "Return Method is required.";

  // Conditional status fields — only the section for the current status
  // applies; hidden sections never block Save.
  if (f.status === "Cancelled" && !f.cancellationReason.trim())
    e.cancellationReason = "Cancellation Reason is required.";
  if (isShortenedOrExtended(f.status)) {
    if (!f.actualReturnDate.trim())
      e.actualReturnDate = "Actual Return Date is required.";
    else if (!isValidMdy(f.actualReturnDate))
      e.actualReturnDate = "Enter a valid date (MM/DD/YYYY).";
    if (timeToMinutes(f.actualReturnTime) === null)
      e.actualReturnTime = "Actual Return Time is required.";
    if (!f.changeReason.trim())
      e.changeReason = "Change Reason is required.";
  }

  if (f.repeats) Object.assign(e, validateRecurrence(f, e));

  return e;
}

const WHOLE_POSITIVE = /^[1-9]\d*$/;

/** Recurrence rules (only when Repeats is checked). The entered Start/End
 *  Dates are the first occurrence, so they must fall on the chosen
 *  Departure/Return Days — that keeps the generated pattern unambiguous. */
function validateRecurrence(
  f: PassFormValues,
  existing: PassFormErrors,
): PassFormErrors {
  const e: PassFormErrors = {};
  if (!WHOLE_POSITIVE.test(f.repeatEvery.trim()))
    e.repeatEvery =
      "Repeat Every must be a whole number of weeks (1 or more).";
  if (!f.departureDay)
    e.departureDay = "Departure Day is required.";
  if (!f.returnDay) e.returnDay = "Return Day is required.";
  if (!f.ends) e.ends = "Ends is required.";
  else if (f.ends === "onDate") {
    if (!f.endsOnDate.trim())
      e.endsOnDate = "Recurrence End Date is required.";
    else if (!isValidMdy(f.endsOnDate))
      e.endsOnDate = "Enter a valid date (MM/DD/YYYY).";
    else if (
      !existing.startDate &&
      mdyToIso(f.endsOnDate) < mdyToIso(f.startDate)
    )
      e.endsOnDate =
        "Recurrence End Date cannot be before Start Date.";
  } else if (!WHOLE_POSITIVE.test(f.numberOfPasses.trim()))
    e.numberOfPasses =
      "Number of Passes must be a whole number (1 or more).";

  if (
    !existing.startDate &&
    f.departureDay &&
    weekdayOfIso(mdyToIso(f.startDate)) !== f.departureDay
  )
    e.startDate = `Start Date must be a ${f.departureDay} to match Departure Day.`;
  if (
    !existing.endDate &&
    f.returnDay &&
    weekdayOfIso(mdyToIso(f.endDate)) !== f.returnDay
  )
    e.endDate = `End Date must be a ${f.returnDay} to match Return Day.`;
  return e;
}

// ─── Calendar-date-safe helpers (no UTC: local Y/M/D only) ─────────────────

function isoToLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function localDateToIso(dt: Date): string {
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${mm}-${dd}`;
}

export function addDaysIso(iso: string, days: number): string {
  const dt = isoToLocalDate(iso);
  dt.setDate(dt.getDate() + days);
  return localDateToIso(dt);
}

export function weekdayOfIso(iso: string): Weekday {
  return WEEKDAYS[isoToLocalDate(iso).getDay()];
}

/** Safety cap so an "On Date" far in the future can't generate thousands. */
export const MAX_PASS_OCCURRENCES = 104;

/** The [start, end] ISO dates of every occurrence: the first is the entered
 *  Start/End Date; each next one is shifted by repeatEveryWeeks × 7 days,
 *  keeping the same length. Stops at Number of Passes, or at the last
 *  occurrence that starts on/before the recurrence End Date. */
export function generateOccurrenceDates(
  firstStartIso: string,
  firstEndIso: string,
  r: PassRecurrence,
): { startDate: string; endDate: string }[] {
  const step = r.repeatEveryWeeks * 7;
  const out: { startDate: string; endDate: string }[] = [];
  for (let i = 0; i < MAX_PASS_OCCURRENCES; i++) {
    const startDate = addDaysIso(firstStartIso, i * step);
    if (r.ends === "afterCount" && i >= (r.numberOfPasses ?? 0))
      break;
    if (r.ends === "onDate" && startDate > (r.endsOnDate ?? ""))
      break;
    out.push({
      startDate,
      endDate: addDaysIso(firstEndIso, i * step),
    });
  }
  return out;
}

export function formToRecurrence(
  f: PassFormValues,
): PassRecurrence | null {
  if (!f.repeats) return null;
  return {
    repeatEveryWeeks: Number(f.repeatEvery),
    departureDay: f.departureDay as Weekday,
    returnDay: f.returnDay as Weekday,
    ends: f.ends as "onDate" | "afterCount",
    ...(f.ends === "onDate"
      ? { endsOnDate: mdyToIso(f.endsOnDate) }
      : { numberOfPasses: Number(f.numberOfPasses) }),
  };
}

export function describeRecurrence(r: PassRecurrence): string {
  const every =
    r.repeatEveryWeeks === 1
      ? "Every week"
      : `Every ${r.repeatEveryWeeks} weeks`;
  const ends =
    r.ends === "onDate"
      ? `until ${isoToMdy(r.endsOnDate ?? "")}`
      : `for ${r.numberOfPasses} passes`;
  return `${every}, ${r.departureDay} → ${r.returnDay}, ${ends}`;
}

// ─── Series edit scope ─────────────────────────────────────────────────────

export type PassSeriesScope = "this" | "future" | "series";

/** Fields an edit may carry to OTHER occurrences in a series. Dates are
 *  deliberately excluded (each occurrence keeps its own dates), as are the
 *  youth and the Shortened/Extended actuals, which only make sense for one
 *  specific occurrence. Only fields the user actually changed propagate,
 *  so other occurrences' own edits to unchanged fields are preserved. */
const SERIES_FIELDS = [
  "programId",
  "status",
  "cancellationReason",
  "departureTime",
  "returnTime",
  "stayingWithType",
  "stayingWithConstituentId",
  "stayingWithName",
  "phone",
  "stayingAtType",
  "stayingAtAddressId",
  "stayingAtAddress",
  "departureMethod",
  "returnMethod",
  "transportationDetails",
  "noteworthyDetails",
] as const satisfies readonly (keyof PassRecord)[];

/** Occurrences a scope affects, chronologically. "future" = the selected
 *  occurrence and every occurrence starting on/after it (by date, not array
 *  position). */
export function scopeTargets(
  selected: PassRecord,
  series: PassRecord[],
  scope: PassSeriesScope,
): PassRecord[] {
  if (scope === "this" || !selected.seriesId) return [selected];
  if (scope === "series") return series;
  return series.filter(
    (p) =>
      p.id === selected.id ||
      p.startDate > selected.startDate ||
      (p.startDate === selected.startDate &&
        p.id > selected.id),
  );
}

/** Applies an edit of `selected` (original → edited) across the scope.
 *  The selected occurrence takes every edited field; the others take only
 *  the changed SERIES_FIELDS. */
export function applyPassEdit(
  original: PassRecord,
  edited: PassRecord,
  series: PassRecord[],
  scope: PassSeriesScope,
): PassRecord[] {
  const changed = SERIES_FIELDS.filter(
    (k) => original[k] !== edited[k],
  );
  return scopeTargets(original, series, scope).map((p) => {
    if (p.id === original.id) return edited;
    const next = { ...p, updatedAt: edited.updatedAt };
    for (const k of changed)
      (next as Record<string, unknown>)[k] = edited[k];
    // A status change to anything but Cancelled clears a stale reason.
    if (
      changed.includes("status") &&
      next.status !== "Cancelled"
    )
      next.cancellationReason = "";
    return next;
  });
}

// ─── Field history ─────────────────────────────────────────────────────────

function trackedValues(
  p: PassRecord,
): Record<PassTrackedField, string> {
  return {
    "Start Date": isoToMdy(p.startDate),
    "Departure Time": p.departureTime,
    "End Date": isoToMdy(p.endDate),
    "Return Time": p.returnTime,
    "Who will the youth be staying with?":
      p.stayingWithType === "other"
        ? `Other: ${p.stayingWithName}`
        : p.stayingWithName,
    "Where will the youth be staying?":
      p.stayingAtType === "other"
        ? `Other: ${p.stayingAtAddress}`
        : p.stayingAtAddress,
    Status: p.status,
  };
}

/** One entry per tracked field whose value actually changed — nothing for
 *  unchanged fields. Call once per persisted save, never during render. */
export function diffPassHistory(
  before: PassRecord,
  after: PassRecord,
  changedBy: string,
  changedAt: string,
): Omit<PassHistoryEntry, "id">[] {
  const a = trackedValues(before);
  const b = trackedValues(after);
  return (Object.keys(a) as PassTrackedField[])
    .filter((field) => a[field] !== b[field])
    .map((field) => ({
      passId: after.id,
      field,
      previousValue: a[field],
      newValue: b[field],
      changedBy,
      changedAt,
    }));
}

// ─── Who / Where option sources ────────────────────────────────────────────

/** Address choices for "Where will the youth be staying?": the selected
 *  youth's addresses plus the selected eligible constituent's — nothing
 *  else. Values are "youth:<id>" / "constituent:<id>". */
export function getPassAddressOptions(
  youthId: string,
  stayingWith: string,
): { value: string; label: string; address: ContactAddress }[] {
  if (!youthId) return [];
  const youthName = getYouthName(youthId) || "Youth";
  const own = getYouthAddresses(youthId).map((a) => ({
    value: `youth:${a.id}`,
    label: `${youthName} — ${a.label}: ${a.line}`,
    address: a,
  }));
  const rel = getPassEligibleRelationships(youthId).find(
    (r) => r.constituentId === stayingWith,
  );
  const theirs = (rel?.addresses ?? []).map((a) => ({
    value: `constituent:${a.id}`,
    label: `${rel!.firstName} ${rel!.lastName} — ${a.label}: ${a.line}`,
    address: a,
  }));
  return [...own, ...theirs];
}

/** Form values → the stored Pass fields (everything except identity and
 *  audit stamps). Resolves the constituent's display name and a snapshot of
 *  the chosen address so List/Calendar can show them directly. */
export function formToPassFields(
  f: PassFormValues,
): Omit<
  PassRecord,
  "id" | "recordName" | "createdBy" | "createdAt" | "updatedAt"
> {
  const rel = getPassEligibleRelationships(f.youthId).find(
    (r) => r.constituentId === f.stayingWith,
  );
  const isOtherWho = f.stayingWith === PASS_OTHER;
  const isOtherWhere = f.stayingAt === PASS_OTHER;
  const [atType, atId] = f.stayingAt.split(":");
  const chosen = getPassAddressOptions(
    f.youthId,
    f.stayingWith,
  ).find((o) => o.value === f.stayingAt);
  return {
    youthId: f.youthId,
    programId: Number(f.programId),
    status: f.status,
    startDate: mdyToIso(f.startDate),
    departureTime: f.departureTime,
    endDate: mdyToIso(f.endDate),
    returnTime: f.returnTime,
    stayingWithType: isOtherWho ? "other" : "constituent",
    stayingWithConstituentId: isOtherWho ? null : f.stayingWith,
    stayingWithName: isOtherWho
      ? f.otherName.trim()
      : rel
        ? `${rel.firstName} ${rel.lastName}`
        : "",
    phone: f.phone,
    stayingAtType: isOtherWhere
      ? "other"
      : (atType as "youth" | "constituent"),
    stayingAtAddressId: isOtherWhere ? null : (atId ?? null),
    stayingAtAddress: isOtherWhere
      ? f.otherAddress.trim()
      : (chosen?.address.line ?? ""),
    departureMethod: f.departureMethod as TransportMethod,
    returnMethod: f.returnMethod as TransportMethod,
    transportationDetails: f.transportationDetails.trim(),
    noteworthyDetails: f.noteworthyDetails.trim(),
    // Conditional fields are stored only while their status applies.
    cancellationReason:
      f.status === "Cancelled"
        ? f.cancellationReason.trim()
        : "",
    actualReturnDate: isShortenedOrExtended(f.status)
      ? mdyToIso(f.actualReturnDate)
      : "",
    actualReturnTime: isShortenedOrExtended(f.status)
      ? f.actualReturnTime
      : "",
    changeReason: isShortenedOrExtended(f.status)
      ? f.changeReason.trim()
      : "",
  };
}

// ─── List helpers (19992) ──────────────────────────────────────────────────

export type PassRelativeDate =
  "all" | "today" | "thisWeek" | "next7" | "last30";

export const PASS_RELATIVE_DATE_OPTIONS: {
  value: PassRelativeDate;
  label: string;
}[] = [
  { value: "all", label: "All Dates" },
  { value: "today", label: "Today" },
  { value: "thisWeek", label: "This Week" },
  { value: "next7", label: "Next 7 Days" },
  { value: "last30", label: "Last 30 Days" },
];

/** Inclusive [from, to] ISO range for a relative preset, from local today.
 *  This Week = Sunday–Saturday; Next 7 Days = today + 6; Last 30 Days =
 *  today − 29 through today. Null for "all". */
export function relativeDateRange(
  key: PassRelativeDate,
  todayIso: string,
): [string, string] | null {
  switch (key) {
    case "today":
      return [todayIso, todayIso];
    case "thisWeek": {
      const dow = WEEKDAYS.indexOf(weekdayOfIso(todayIso));
      return [
        addDaysIso(todayIso, -dow),
        addDaysIso(todayIso, 6 - dow),
      ];
    }
    case "next7":
      return [todayIso, addDaysIso(todayIso, 6)];
    case "last30":
      return [addDaysIso(todayIso, -29), todayIso];
    default:
      return null;
  }
}