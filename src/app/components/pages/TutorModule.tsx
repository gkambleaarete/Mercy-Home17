import React, { useState, useMemo } from "react"
import {
  BookOpen,
  RefreshCw,
  Plus,
  Pencil,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Users,
  Check,
  Filter,
  ExternalLink,
  AlignLeft,
} from "@/app/lib/lucide-icons"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { DateInput } from "../ui/date-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Badge } from "../ui/badge"
import { PaginationInfo } from "../ui/pagination"
import { TablePaginationBar } from "../ui/table-toolbar"
import { toast } from "sonner"
import {
  approvedTutorOptions,
  fixtureTutorRef,
  getTutorMatchSnapshot,
  labelForRef,
  listedMatches,
  newTutorMatchId,
  saveTutorMatch,
  scheduledSessions,
  useTutorMatchSnapshot,
  youthOptions,
  type SaveResult,
  type TutorMatch as StoredTutorMatch,
  type TutorMatchInput,
} from "../../data/tutorMatchStore"
import { formatDayNumber } from "../../data/tutorRecurrence"
import { useTutorRecords } from "../../data/tutorApplicantStore"

// ─── Types ────────────────────────────────────────────────────────────────────

type Campus = "West Loop Campus" | "Walsh Campus" | "Other" | "Offsite"
type WeekDay = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday"

// Replaces the old title1 boolean — ECR: reporting needs to identify
// Matches/Sessions as Contract, Title 1, or In-Kind, which the previous
// Yes/No flag couldn't represent on its own.
type FundingType = "Contract" | "Title 1" | "In-Kind"

// View model of a stored Tutor Match (US 20093: data/tutorMatchStore is
// the source of truth). `tutor` / `youth` are the display names the
// existing filters, search and calendar use; identities are tutorId /
// youthId.
type TutorMatch = Omit<StoredTutorMatch, "campus"> & {
  tutor: string
  youth: string
  campus: Campus
}

const toView = (m: StoredTutorMatch): TutorMatch => ({
  ...m,
  tutor: m.tutorName,
  youth: m.youthName,
  campus: m.campus as Campus,
})

interface TutorSession {
  id: string
  matchId: string
  date: string // MM/DD/YYYY
  dayOfWeek: string
  startTime: string
  endTime: string
  tutor: string
  youth: string
  program: string
  campus: Campus
  location: string
  // Sessions are generated on the fly from their parent Match (see
  // generateSessions) and have no persisted fields of their own — funding
  // classification is copied through from the Match the same way tutor,
  // youth, program, campus, and location already are.
  fundingType?: FundingType
}

// ─── Constants ────────────────────────────────────────────────────────────────

// AC26: modal only allows these 3; filter (AC9) adds Offsite
const MODAL_CAMPUSES: Campus[] = ["West Loop Campus", "Walsh Campus", "Other"]
const FILTER_CAMPUSES: Campus[] = [
  "West Loop Campus",
  "Walsh Campus",
  "Other",
  "Offsite",
]
const ALL_DAYS: WeekDay[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]
const EDITABLE_DAYS: WeekDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
]

const TUTORS = [
  "Angela Brooks",
  "David Kim",
  "James Carter",
  "Maria Gonzalez",
  "Sandra Okafor",
  "Thomas Nguyen",
  "Kevin Walsh",
  "Priya Nair",
]

const PROGRAMS = [
  "Residential",
  "Transitional Living",
  "Day Treatment",
  "Foster Care",
  "Community Support",
]

const LOCATIONS = [
  "Room 101 – West Loop",
  "Room 203 – West Loop",
  "Library – West Loop",
  "Room 105 – Walsh",
  "Conference Room A – Walsh",
  "Learning Center – Walsh",
  "Virtual (Teams)",
  "Community Center",
  "Other",
]

// Sample Matches now live in data/tutorMatchStore (seed).

// ─── Session generator ────────────────────────────────────────────────────────

function parseMDY(s: string): Date | null {
  const p = s.split("/")
  if (p.length !== 3) return null
  return new Date(+p[2], +p[0] - 1, +p[1])
}

function formatMDY(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`
}

const DAY_NAMES: WeekDay[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

/**
 * Sessions of `matches` between `from` and `to` (inclusive) for the
 * calendars and lists. Uses the shared recurrence function and the stored
 * Tutor Session records (US 20093) — never a separate local generator.
 */
function generateSessions(
  matches: TutorMatch[],
  from: Date,
  to: Date,
): TutorSession[] {
  const byId = new Map(matches.map((m) => [m.id, m]))
  return scheduledSessions(
    getTutorMatchSnapshot(),
    matches,
    formatMDY(from),
    formatMDY(to),
  ).map((o) => {
    const m = byId.get(o.matchId)!
    return {
      id: o.id,
      matchId: o.matchId,
      date: o.date,
      dayOfWeek: DAY_NAMES[parseMDY(o.date)!.getDay()],
      startTime: o.startTime,
      endTime: o.endTime,
      tutor: m.tutor,
      youth: m.youth,
      program: m.program,
      campus: m.campus,
      location: m.location,
      fundingType: m.fundingType as FundingType | undefined,
    }
  })
}

function getWeekStart(d: Date): Date {
  const dt = new Date(d)
  dt.setDate(dt.getDate() - dt.getDay())
  dt.setHours(0, 0, 0, 0)
  return dt
}

function parse12HTime(t: string): number {
  // returns minutes since midnight for sorting
  const m = t.match(/^(\d+):(\d+)\s*(AM|PM)$/i)
  if (!m) return 0
  let h = parseInt(m[1])
  const min = parseInt(m[2])
  const ampm = m[3].toUpperCase()
  if (ampm === "PM" && h !== 12) h += 12
  if (ampm === "AM" && h === 12) h = 0
  return h * 60 + min
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

const inputSty = (err?: unknown): React.CSSProperties => ({
  height: "36px",
  width: "100%",
  padding: "0 12px",
  borderRadius: "4px",
  border: `1px solid ${err ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
  color: "var(--slds-g-color-text-default)",
  backgroundColor: "var(--slds-g-color-background-base)",
  fontSize: "13px",
  outline: "none",
})

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label
      className="block mb-1.5"
      style={{
        fontSize: "11px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: "var(--slds-g-color-text-weak)",
      }}
    >
      {children}
      {required && <span className="text-red-600">*</span>}
    </label>
  )
}

function ErrMsg({ msg, id }: { msg: string; id?: string }) {
  return (
    <p
      id={id}
      style={{
        fontSize: "11px",
        color: "#c23934",
        marginTop: "2px",
      }}
    >
      {msg}
    </p>
  )
}

// ─── Tutor Match Modal ────────────────────────────────────────────────────────

const emptyForm = (): Partial<TutorMatch> => ({
  tutorId: "",
  youthId: "",
  tutor: "",
  youth: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  days: [],
  program: "",
  campus: undefined,
  otherLocation: "",
  location: "",
  fundingType: undefined,
  comment: "",
  recursEvery: 1,
})

function TutorMatchModal({
  open,
  onClose,
  editing,
  onSave,
  /** Saves through the shared Tutor Match service (US 20093). */
}: {
  open: boolean
  onClose: () => void
  editing: TutorMatch | null
  onSave: (m: TutorMatchInput) => SaveResult
}) {
  const [form, setForm] = useState<Partial<TutorMatch>>(emptyForm())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  // Match identity reserved when the form opens, reused on every retry so a
  // failed or repeated save can never create a second Match.
  const matchIdRef = React.useRef<string>("")

  React.useEffect(() => {
    if (open) {
      setForm(editing ? { ...editing } : emptyForm())
      setErrors({})
      setSaving(false)
      matchIdRef.current = editing?.id ?? newTutorMatchId()
    }
  }, [open, editing])

  // Youth: real Youth Constituents (by Constituent ID). A seeded Match's
  // fixture youth stays selectable for that Match only.
  const youthChoices = React.useMemo(() => {
    const list = youthOptions()
    if (editing && !list.some((y) => y.id === editing.youthId))
      list.unshift({
        id: editing.youthId,
        name: editing.youthName,
      })
    return list
  }, [editing])
  // Tutor: eligible tutor applicants (live: approved and not inactive) +
  // the existing sample tutors (prototype fixtures with their own ids).
  const tutorRecords = useTutorRecords()
  const tutorChoices = React.useMemo(() => {
    const list = [...approvedTutorOptions(), ...TUTORS.map(fixtureTutorRef)]
    if (editing && !list.some((t) => t.id === editing.tutorId))
      list.unshift({
        id: editing.tutorId,
        name: editing.tutorName,
      })
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, tutorRecords])

  const set = <K extends keyof TutorMatch>(k: K, v: TutorMatch[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[(k as string)])
      setErrors((e) => {
        const n = { ...e }
        delete n[(k as string)]
        return n
      })
  }

  const toggleDay = (day: WeekDay) => {
    const days = form.days ?? []
    set(
      "days",
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day],
    )
  }

  const handleSave = () => {
    if (saving) return // no second save while one is in progress
    const errs: Record<string, string> = {}
    if (!form.youthId) errs.youthId = "Youth is required."
    if (!form.tutorId) errs.tutorId = "Tutor is required."
    if (!form.campus) errs.campus = "Campus is required."
    if (!form.location) errs.location = "Location is required."
    if (!form.startDate?.trim()) errs.startDate = "Required."
    if (!form.endDate?.trim()) errs.endDate = "Required."
    if (!form.startTime?.trim()) errs.startTime = "Required."
    if (!form.endTime?.trim()) errs.endTime = "Required."
    if (form.recursEvery === undefined || Number.isNaN(form.recursEvery))
      errs.recursEvery = "Required."
    if (!(form.days ?? []).length) errs.days = "Select at least one day."
    const focusFirst = (e: Record<string, string>) =>
      requestAnimationFrame(() => {
        const order = [
          "youthId",
          "tutorId",
          "campus",
          "location",
          "startDate",
          "endDate",
          "startTime",
          "endTime",
          "recursEvery",
          "days",
        ]
        const k = order.find((x) => e[x])
        if (k) document.getElementById(`tm-${k}`)?.focus()
      })
    if (Object.keys(errs).length) {
      setErrors(errs)
      focusFirst(errs)
      return
    }
    setSaving(true)
    const result = onSave({
      id: matchIdRef.current,
      tutorId: form.tutorId!,
      tutorName: tutorChoices.find((t) => t.id === form.tutorId)?.name ?? "",
      youthId: form.youthId!,
      youthName: youthChoices.find((y) => y.id === form.youthId)?.name ?? "",
      startDate: form.startDate!,
      endDate: form.endDate!,
      startTime: form.startTime!.trim(),
      endTime: form.endTime!.trim(),
      days: form.days ?? [],
      program: form.program ?? "",
      campus: form.campus!,
      otherLocation: form.otherLocation ?? "",
      location: form.location!,
      fundingType: form.fundingType,
      comment: form.comment ?? "",
      recursEvery: form.recursEvery ?? 1,
    })
    setSaving(false)
    if (!result.ok) {
      // Keep the modal open with the user's values.
      const e = (result.errors ?? {}) as Record<string, string>
      if (Object.keys(e).length) {
        setErrors(e)
        focusFirst(e)
      }
      return
    }
    onClose()
  }

  const selectSty: React.CSSProperties = {
    ...inputSty(),
    padding: "0 12px",
    cursor: "pointer",
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose()
      }}
    >
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-2xl max-h-[90vh] flex flex-col p-0"
        style={{
          backgroundColor: "var(--slds-g-color-background-base)",
          border: "1px solid var(--slds-g-color-border-base-1)",
        }}
      >
        <DialogHeader
          className="px-6 pt-6 pb-4"
          style={{
            borderBottom: "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 flex items-center justify-center text-white flex-shrink-0"
              style={{
                borderRadius: "var(--slds-c-card-radius-border)",
                backgroundColor: "var(--color-brand-primary)",
              }}
            >
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                {editing ? "Edit Tutor Match" : "New Tutor Match"}
              </DialogTitle>
              <DialogDescription
                style={{
                  fontSize: "12px",
                  marginTop: "2px",
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {editing
                  ? //? `Editing ${editing.id}`
                    ``
                  : "Create a new tutor-to-youth match record"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Youth / Tutor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Youth </FieldLabel>
              <Select
                value={form.youthId ?? ""}
                onValueChange={(v) => set("youthId", v)}
              >
                <SelectTrigger
                  id="tm-youthId"
                  aria-invalid={!!errors.youthId}
                  aria-describedby={
                    errors.youthId ? "tm-youthId-error" : undefined
                  }
                  className="h-9 w-full slds-text-4"
                  style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor: "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>

                <SelectContent>
                  {youthChoices.map((y) => (
                    <SelectItem key={y.id} value={y.id}>
                      {labelForRef(youthChoices, y.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.youthId && (
                <ErrMsg id="tm-youthId-error" msg={errors.youthId} />
              )}
            </div>
            <div>
              <FieldLabel required>Tutor </FieldLabel>
              <Select
                value={form.tutorId ?? ""}
                onValueChange={(v) => set("tutorId", v)}
              >
                <SelectTrigger
                  id="tm-tutorId"
                  aria-invalid={!!errors.tutorId}
                  aria-describedby={
                    errors.tutorId ? "tm-tutorId-error" : undefined
                  }
                  className="h-9 w-full slds-text-4"
                  style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor: "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>

                <SelectContent>
                  {tutorChoices.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {labelForRef(tutorChoices, t.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.tutorId && (
                <ErrMsg id="tm-tutorId-error" msg={errors.tutorId} />
              )}
            </div>
          </div>

          {/* Program / Campus */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Program </FieldLabel>
              <Select
                value={form.program ?? ""}
                onValueChange={(v) => set("program", v)}
              >
                <SelectTrigger
                  className="h-9 w-full slds-text-4"
                  style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor: "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>

                <SelectContent>
                  {PROGRAMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel required>Campus</FieldLabel>

              <Select
                value={form.campus ?? ""}
                onValueChange={(v) => set("campus", v as Campus)}
              >
                <SelectTrigger
                  id="tm-campus"
                  aria-invalid={!!errors.campus}
                  aria-describedby={
                    errors.campus ? "tm-campus-error" : undefined
                  }
                  className="h-9 w-full slds-text-4"
                  style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor: "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>

                <SelectContent>
                  {MODAL_CAMPUSES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.campus && (
                <ErrMsg id="tm-campus-error" msg={errors.campus} />
              )}
            </div>
          </div>

          {/* Location / Other Location (conditional) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Location</FieldLabel>

              <Select
                value={form.location ?? ""}
                onValueChange={(v) => set("location", v)}
              >
                <SelectTrigger
                  id="tm-location"
                  aria-invalid={!!errors.location}
                  aria-describedby={
                    errors.location ? "tm-location-error" : undefined
                  }
                  className="h-9 w-full slds-text-4"
                  style={{
                    border: "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor: "var(--slds-g-color-background-base)",
                  }}
                >
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>

                <SelectContent>
                  {LOCATIONS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.location && (
                <ErrMsg id="tm-location-error" msg={errors.location} />
              )}
            </div>
            {form.campus === "Other" && (
              <div>
                <FieldLabel>Other Location</FieldLabel>
                <input
                  type="text"
                  placeholder="Street address or venue name"
                  value={form.otherLocation ?? ""}
                  onChange={(e) => set("otherLocation", e.target.value)}
                  style={inputSty()}
                />
              </div>
            )}
          </div>

          {/* Start/End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Start Date </FieldLabel>
              <DateInput
                id="tm-startDate"
                aria-invalid={!!errors.startDate}
                aria-describedby={
                  errors.startDate ? "tm-startDate-error" : undefined
                }
                value={form.startDate ?? ""}
                onChange={(v) => set("startDate", v)}
                required
                style={
                  errors.startDate ? { borderColor: "#c23934" } : undefined
                }
              />
              {errors.startDate && (
                <ErrMsg id="tm-startDate-error" msg={errors.startDate} />
              )}
            </div>
            <div>
              <FieldLabel required>End Date </FieldLabel>
              <DateInput
                id="tm-endDate"
                aria-invalid={!!errors.endDate}
                aria-describedby={
                  errors.endDate ? "tm-endDate-error" : undefined
                }
                value={form.endDate ?? ""}
                onChange={(v) => set("endDate", v)}
                required
                style={errors.endDate ? { borderColor: "#c23934" } : undefined}
              />
              {errors.endDate && (
                <ErrMsg id="tm-endDate-error" msg={errors.endDate} />
              )}
            </div>
          </div>

          {/* Start/End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Start Time </FieldLabel>
              <input
                type="text"
                placeholder="HH:MM AM/PM"
                id="tm-startTime"
                aria-required
                aria-invalid={!!errors.startTime}
                aria-describedby={
                  errors.startTime ? "tm-startTime-error" : undefined
                }
                value={form.startTime ?? ""}
                onChange={(e) => set("startTime", e.target.value)}
                style={inputSty(errors.startTime)}
              />
              {errors.startTime && (
                <ErrMsg id="tm-startTime-error" msg={errors.startTime} />
              )}
            </div>
            <div>
              <FieldLabel required>End Time</FieldLabel>
              <input
                type="text"
                placeholder="HH:MM AM/PM"
                id="tm-endTime"
                aria-required
                aria-invalid={!!errors.endTime}
                aria-describedby={
                  errors.endTime ? "tm-endTime-error" : undefined
                }
                value={form.endTime ?? ""}
                onChange={(e) => set("endTime", e.target.value)}
                style={inputSty(errors.endTime)}
              />
              {errors.endTime && (
                <ErrMsg id="tm-endTime-error" msg={errors.endTime} />
              )}
            </div>
          </div>

          {/* Recurs Every + Days */}
          <div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <FieldLabel required>Recurs Every (weeks)</FieldLabel>
                <input
                  id="tm-recursEvery"
                  aria-invalid={!!errors.recursEvery}
                  aria-describedby={
                    errors.recursEvery ? "tm-recursEvery-error" : undefined
                  }
                  type="number"
                  min={1}
                  max={52}
                  value={form.recursEvery ?? 1}
                  onChange={(e) => set("recursEvery", Number(e.target.value))}
                  style={inputSty(errors.recursEvery)}
                />
                {errors.recursEvery && (
                  <ErrMsg id="tm-recursEvery-error" msg={errors.recursEvery} />
                )}
              </div>
            </div>
            <FieldLabel required>Days</FieldLabel>
            <div
              id="tm-days"
              tabIndex={-1}
              role="group"
              aria-label="Days"
              aria-describedby={errors.days ? "tm-days-error" : undefined}
              className="flex items-center gap-2 flex-wrap mt-1 outline-none"
            >
              {ALL_DAYS.map((day) => {
                const editable = EDITABLE_DAYS.includes(day)
                const checked = (form.days ?? []).includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={checked}
                    aria-label={day}
                    onClick={() => editable && toggleDay(day)}
                    disabled={!editable}
                    className="px-3 py-1.5 rounded-full transition-colors"
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      border: `1px solid ${
                        checked
                          ? "#145F33"
                          : "var(--slds-g-color-border-base-1)"
                      }`,
                      backgroundColor: checked ? "#145F33" : "transparent",
                      color: checked
                        ? "white"
                        : editable
                          ? "var(--slds-g-color-text-default)"
                          : "var(--slds-g-color-text-weak)",
                      cursor: editable ? "pointer" : "not-allowed",
                      opacity: editable ? 1 : 0.5,
                    }}
                  >
                    {day.slice(0, 3)}
                  </button>
                )
              })}
            </div>
            {errors.days && <ErrMsg id="tm-days-error" msg={errors.days} />}
          </div>

          {/* Comment */}
          <div>
            <FieldLabel>Comment</FieldLabel>
            <textarea
              value={form.comment ?? ""}
              onChange={(e) => set("comment", e.target.value)}
              placeholder="Notes about this tutor match..."
              rows={2}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
                backgroundColor: "var(--slds-g-color-background-base)",
                fontSize: "13px",
                outline: "none",
                resize: "vertical" as const,
              }}
            />
          </div>
        </div>

        <DialogFooter
          className="px-6 py-4 flex items-center justify-end gap-2"
          style={{
            borderTop: "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          <Button
            variant="outline"
            className="h-9 px-4 rounded-full"
            style={{
              borderColor: "var(--slds-g-color-border-base-1)",
              color: "var(--slds-g-color-text-weak)",
              fontSize: "13px",
            }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="h-9 px-5 rounded-full text-white"
            style={{
              backgroundColor: "#145F33",
              fontSize: "13px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#0e4524")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#145F33")
            }
            onClick={handleSave}
            disabled={saving}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Digital Calendar Modal ───────────────────────────────────────────────────

// ─── Teams-style time-grid calendar ──────────────────────────────────────────

const CAL_START_HOUR = 7 // 7 AM
const CAL_END_HOUR = 21 // 9 PM
const HOUR_PX = 64 // px per hour
const TOTAL_PX = (CAL_END_HOUR - CAL_START_HOUR) * HOUR_PX
const TIME_COL_W = 52 // px for the left time label column

// Map tutor index → colour pair {bg, border, text}
const EVENT_PALETTE = [
  { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  { bg: "#dcfce7", border: "#22c55e", text: "#15803d" },
  { bg: "#fef9c3", border: "#eab308", text: "#854d0e" },
  { bg: "#ede9fe", border: "#a78bfa", text: "#5b21b6" },
  { bg: "#fce7f3", border: "#f472b6", text: "#9d174d" },
  { bg: "#ffedd5", border: "#fb923c", text: "#9a3412" },
  { bg: "#cffafe", border: "#22d3ee", text: "#155e75" },
  { bg: "#f0fdf4", border: "#4ade80", text: "#166534" },
]

const tutorColorMap = new Map<string, typeof EVENT_PALETTE[0]>()
TUTORS.forEach((t, i) =>
  tutorColorMap.set(t, EVENT_PALETTE[i % EVENT_PALETTE.length]),
)

function eventTop(time: string): number {
  const min = parse12HTime(time)
  return Math.max(0, ((min - CAL_START_HOUR * 60) / 60) * HOUR_PX)
}
function eventHeight(start: string, end: string): number {
  const dur = parse12HTime(end) - parse12HTime(start)
  return Math.max(dur > 0 ? (dur / 60) * HOUR_PX : HOUR_PX, 28)
}

function DigitalCalendarModal({
  open,
  onClose,
  matches,
  initialWeek,
  onOpenMatch,
}: {
  open: boolean
  onClose: () => void
  matches: TutorMatch[]
  initialWeek?: Date
  onOpenMatch: (m: TutorMatch) => void
}) {
  const [viewMode, setViewMode] = useState<"week" | "month">("week") // AC39/AC40
  const [weekStart, setWeekStart] = useState<Date>(() =>
    getWeekStart(initialWeek ?? new Date()),
  )
  const [filterYouth, setFilterYouth] = useState("all")
  const [filterTutor, setFilterTutor] = useState("all")
  const [filterCampus, setFilterCampus] = useState("all")
  const [filterProgram, setFilterProgram] = useState("all")
  const gridRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (open) {
      setWeekStart(getWeekStart(initialWeek ?? new Date()))
      // scroll to 8 AM on open
      setTimeout(() => {
        if (gridRef.current) gridRef.current.scrollTop = HOUR_PX
      }, 80)
    }
  }, [open, initialWeek])

  const rangeEnd = new Date(weekStart)
  rangeEnd.setDate(rangeEnd.getDate() + 6)

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart)
        d.setDate(d.getDate() + i)
        return d
      }),
    [weekStart],
  )

  const allSessions = useMemo(() => {
    const filt = matches.filter(
      (m) =>
        (filterYouth === "all" || m.youth === filterYouth) &&
        (filterTutor === "all" || m.tutor === filterTutor) &&
        (filterCampus === "all" || m.campus === filterCampus) &&
        (filterProgram === "all" || m.program === filterProgram),
    )
    return generateSessions(filt, weekStart, rangeEnd)
  }, [
    matches,
    weekStart,
    filterYouth,
    filterTutor,
    filterCampus,
    filterProgram,
  ])

  const sessionsForDay = (d: Date) => {
    const ds = formatMDY(d)
    return allSessions
      .filter((s) => s.date === ds)
      .sort((a, b) => parse12HTime(a.startTime) - parse12HTime(b.startTime))
  }

  // Current time indicator
  const now = new Date()
  const todayStr = formatMDY(now)
  const isCurrentWeek = weekDays.some((d) => formatMDY(d) === todayStr)
  const currentTimeTop = eventTop(
    `${
      now.getHours() > 12 ? now.getHours() - 12 : now.getHours()
    }:${String(now.getMinutes()).padStart(2, "0")} ${
      now.getHours() >= 12 ? "PM" : "AM"
    }`,
  )

  const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const rangeLabel =
    viewMode === "month"
      ? `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getFullYear()}`
      : weekStart.getMonth() === rangeEnd.getMonth()
        ? `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()}–${rangeEnd.getDate()}, ${rangeEnd.getFullYear()}`
        : `${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()} – ${MONTH_NAMES[rangeEnd.getMonth()]} ${rangeEnd.getDate()}, ${rangeEnd.getFullYear()}`

  // AC42: derive ISO week string for week-picker input (YYYY-Www)
  const toISOWeek = (d: Date) => {
    const tmp = new Date(d)
    tmp.setHours(0, 0, 0, 0)
    tmp.setDate(tmp.getDate() + 4 - (tmp.getDay() || 7))
    const yearStart = new Date(tmp.getFullYear(), 0, 1)
    const weekNo = Math.ceil(
      ((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    )
    return `${tmp.getFullYear()}-W${String(weekNo).padStart(2, "0")}`
  }
  const weekPickerValue = toISOWeek(weekStart)

  // Month view helpers (AC40)
  const monthStart = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1)
  const monthEnd = new Date(
    weekStart.getFullYear(),
    weekStart.getMonth() + 1,
    0,
  )
  const monthDays = useMemo(() => {
    const days: Date[] = []
    const startDow = monthStart.getDay() // 0=Sun
    for (let i = 0; i < startDow; i++) {
      const d = new Date(monthStart)
      d.setDate(d.getDate() - (startDow - i))
      days.push(d)
    }
    for (let i = 1; i <= monthEnd.getDate(); i++)
      days.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), i))
    while (days.length % 7 !== 0) {
      const d = new Date(days[days.length - 1])
      d.setDate(d.getDate() + 1)
      days.push(d)
    }
    return days
  }, [weekStart])

  const monthRangeEnd = new Date(monthEnd)
  const allMonthSessions = useMemo(() => {
    const filt = matches.filter(
      (m) =>
        (filterYouth === "all" || m.youth === filterYouth) &&
        (filterTutor === "all" || m.tutor === filterTutor) &&
        (filterCampus === "all" || m.campus === filterCampus) &&
        (filterProgram === "all" || m.program === filterProgram),
    )
    return generateSessions(filt, monthStart, monthRangeEnd)
  }, [
    matches,
    weekStart,
    filterYouth,
    filterTutor,
    filterCampus,
    filterProgram,
  ])

  const timeLabels = Array.from(
    { length: CAL_END_HOUR - CAL_START_HOUR },
    (_, i) => {
      const h = CAL_START_HOUR + i
      if (h === 12) return "12 PM"
      return h > 12 ? `${h - 12} PM` : `${h} AM`
    },
  )

  const filterSty: React.CSSProperties = {
    height: "30px",
    padding: "0 10px",
    borderRadius: "6px",
    border: "1px solid #e1dfdd",
    backgroundColor: "white",
    fontSize: "12px",
    color: "#323130",
    cursor: "pointer",
    outline: "none",
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose()
      }}
    >
      <DialogContent
        className="flex flex-col p-0 max-w-none"
        style={{
          width: "min(95vw, 1600px)",
          maxWidth: "min(95vw, 1600px)",
          maxHeight: "92vh",
          backgroundColor: "var(--slds-g-color-background-base)",
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        {/* ── SLDS Modal Header ── */}
        <div
          className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{
            backgroundColor: "var(--slds-g-color-background-alt-2)",
            borderBottom: "1px solid var(--slds-g-color-border-base-1)",
            boxShadow: "var(--slds-g-shadow-1)",
          }}
        >
          {/* Left: icon + title + range */}
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 flex items-center justify-center text-white flex-shrink-0"
              style={{
                borderRadius: "var(--slds-c-card-radius-border)",
                backgroundColor: "var(--color-brand-primary)",
              }}
            >
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p
                className="slds-text-6 font-semibold"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Digital Calendar
              </p>
              <p
                className="slds-text-3"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                {viewMode === "week"
                  ? (() => {
                      const MS = [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ]
                      const s = weekDays[0],
                        e = weekDays[6]
                      return s.getMonth() === e.getMonth()
                        ? `${MS[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${e.getFullYear()}`
                        : `${MS[s.getMonth()]} ${s.getDate()} – ${MS[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`
                    })()
                  : rangeLabel}
              </p>
            </div>
          </div>
          {/* Right: nav + week picker + view toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <button
                aria-label="Previous"
                onClick={() => {
                  if (viewMode === "month") {
                    const d = new Date(weekStart)
                    d.setMonth(d.getMonth() - 1)
                    setWeekStart(getWeekStart(d))
                  } else {
                    const d = new Date(weekStart)
                    d.setDate(d.getDate() - 7)
                    setWeekStart(d)
                  }
                }}
                className="h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: "var(--slds-g-color-background-base)",
                  border: "1px solid var(--slds-g-color-border-base-1)",
                  cursor: "pointer",
                  color: "var(--slds-g-color-text-default)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--slds-g-color-background-alt)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--slds-g-color-background-base)")
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                aria-label="Next"
                onClick={() => {
                  if (viewMode === "month") {
                    const d = new Date(weekStart)
                    d.setMonth(d.getMonth() + 1)
                    setWeekStart(getWeekStart(d))
                  } else {
                    const d = new Date(weekStart)
                    d.setDate(d.getDate() + 7)
                    setWeekStart(d)
                  }
                }}
                className="h-8 w-8 rounded-full flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: "var(--slds-g-color-background-base)",
                  border: "1px solid var(--slds-g-color-border-base-1)",
                  cursor: "pointer",
                  color: "var(--slds-g-color-text-default)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--slds-g-color-background-alt)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    "var(--slds-g-color-background-base)")
                }
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => setWeekStart(getWeekStart(new Date()))}
              className="h-8 px-4 rounded-full slds-text-4 font-medium transition-colors"
              style={{
                backgroundColor: "var(--slds-g-color-background-base)",
                border: "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--slds-g-color-background-alt)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--slds-g-color-background-base)")
              }
            >
              Today
            </button>
            {viewMode === "week" &&
              (() => {
                const MS = [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ]
                const s = weekDays[0],
                  e = weekDays[6]
                const label =
                  s.getMonth() === e.getMonth()
                    ? `${MS[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${e.getFullYear()}`
                    : `${MS[s.getMonth()]} ${s.getDate()} – ${MS[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`
                return (
                  <label
                    className="relative h-8 px-3 rounded-full slds-text-3 flex items-center gap-1.5 flex-shrink-0"
                    style={{
                      border: "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor: "var(--slds-g-color-background-base)",
                      color: "var(--slds-g-color-text-default)",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    <Calendar className="h-3.5 w-3.5 flex-shrink-0 opacity-50" />
                    <span>{label}</span>
                    <input
                      type="week"
                      value={weekPickerValue}
                      onChange={(e) => {
                        if (!e.target.value) return
                        const [yr, wk] = e.target.value.split("-W").map(Number)
                        const jan4 = new Date(yr, 0, 4)
                        const d = new Date(jan4)
                        d.setDate(jan4.getDate() - jan4.getDay() + (wk - 1) * 7)
                        setWeekStart(getWeekStart(d))
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      style={{ outline: "none" }}
                    />
                  </label>
                )
              })()}
            {/* Week / Month toggle */}
            <div
              className="flex rounded-full overflow-hidden"
              style={{
                border: "1px solid var(--slds-g-color-border-base-1)",
              }}
            >
              {(["week", "month"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className="h-8 px-4 slds-text-4 font-medium capitalize transition-colors"
                  style={{
                    backgroundColor:
                      viewMode === m
                        ? "var(--color-brand-primary)"
                        : "var(--slds-g-color-background-base)",
                    color:
                      viewMode === m
                        ? "white"
                        : "var(--slds-g-color-text-default)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div
          className="px-6 py-2.5 flex items-center gap-2 flex-wrap flex-shrink-0"
          style={{
            backgroundColor: "var(--slds-g-color-background-alt)",
            borderBottom: "1px solid var(--slds-g-color-border-base-1)",
          }}
        >
          {[
            {
              value: filterYouth,
              set: setFilterYouth,
              opts: [...new Set(matches.map((m) => m.youth))].sort(),
              all: "All Youth",
            },
            {
              value: filterTutor,
              set: setFilterTutor,
              opts: [...new Set(matches.map((m) => m.tutor))].sort(),
              all: "All Tutors",
            },
            {
              value: filterCampus,
              set: setFilterCampus,
              opts: FILTER_CAMPUSES,
              all: "All Campuses",
            },
            {
              value: filterProgram,
              set: setFilterProgram,
              opts: PROGRAMS,
              all: "All Programs",
            },
          ].map(({ value, set, opts, all }) => (
            <select
              key={all}
              value={value}
              onChange={(e) => set(e.target.value)}
              className="h-9 slds-text-4"
              style={{
                padding: "0 10px",
                border: "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor: "var(--slds-g-color-background-base)",
                color: "var(--slds-g-color-text-default)",
                cursor: "pointer",
                outline: "none",
                borderRadius: "var(--slds-c-input-radius-border)",
              }}
            >
              <option value="all">{all}</option>
              {opts.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ))}
          {(filterYouth !== "all" ||
            filterTutor !== "all" ||
            filterCampus !== "all" ||
            filterProgram !== "all") && (
            <button
              onClick={() => {
                setFilterYouth("all")
                setFilterTutor("all")
                setFilterCampus("all")
                setFilterProgram("all")
              }}
              className="h-9 px-3 rounded-full slds-text-3 font-medium flex items-center gap-1 transition-colors"
              style={{
                border: "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor: "var(--slds-g-color-background-base)",
                color: "var(--slds-g-color-text-weak)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--slds-g-color-background-alt-2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--slds-g-color-background-base)")
              }
            >
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        {/* ── MONTH VIEW ── */}
        {viewMode === "month" && (
          <div
            className="flex-1 overflow-y-auto"
            style={{
              backgroundColor: "var(--slds-g-color-background-base)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7,1fr)",
                borderBottom: "1px solid var(--slds-g-color-border-base-1)",
                backgroundColor: "var(--slds-g-color-background-alt)",
              }}
            >
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="slds-text-3 font-semibold"
                  style={{
                    textAlign: "center",
                    padding: "6px 4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--slds-g-color-text-weak)",
                    borderRight: "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  {d.slice(0, 3)}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7,1fr)",
              }}
            >
              {monthDays.map((d, idx) => {
                const isCurrentMonth = d.getMonth() === weekStart.getMonth()
                const isToday = formatMDY(d) === todayStr
                const daySessions = allMonthSessions
                  .filter((s) => s.date === formatMDY(d))
                  .sort(
                    (a, b) =>
                      parse12HTime(a.startTime) - parse12HTime(b.startTime),
                  )
                return (
                  <div
                    key={idx}
                    style={{
                      minHeight: "110px",
                      borderRight:
                        "1px solid var(--slds-g-color-border-base-1)",
                      borderBottom:
                        "1px solid var(--slds-g-color-border-base-1)",
                      padding: "6px",
                      backgroundColor: isToday
                        ? "#f0faf4"
                        : isCurrentMonth
                          ? "var(--slds-g-color-background-base)"
                          : "var(--slds-g-color-background-alt-2)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        className="slds-text-4"
                        style={{
                          fontWeight: isToday ? 700 : 400,
                          color: isToday
                            ? "white"
                            : isCurrentMonth
                              ? "var(--slds-g-color-text-default)"
                              : "var(--slds-g-color-text-weak)",
                          backgroundColor: isToday ? "#145F33" : "transparent",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {d.getDate()}
                      </span>
                    </div>
                    {daySessions.slice(0, 3).map((s) => {
                      const palette =
                        tutorColorMap.get(s.tutor) ?? EVENT_PALETTE[0]
                      const match = matches.find((m) => m.id === s.matchId)
                      return (
                        <button
                          key={s.id}
                          onClick={() => {
                            if (match) {
                              onOpenMatch(match)
                              onClose()
                            }
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "3px 5px",
                            marginBottom: "2px",
                            borderRadius: "4px",
                            backgroundColor: palette.bg,
                            borderLeft: `3px solid ${palette.border}`,
                            color: palette.text,
                            overflow: "hidden",
                            cursor: "pointer",
                            border: `1px solid ${palette.border}20`,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.filter = "brightness(0.93)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.filter = "brightness(1)")
                          }
                        >
                          <div
                            style={{
                              fontSize: "10px",
                              fontWeight: 700,
                              lineHeight: 1.3,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              color: palette.text,
                            }}
                          >
                            {s.startTime}
                          </div>
                          <div
                            style={{
                              fontSize: "10px",
                              lineHeight: 1.3,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              color: palette.text,
                              opacity: 0.8,
                            }}
                          >
                            {s.tutor} · {s.youth}
                          </div>
                        </button>
                      )
                    })}
                    {daySessions.length > 3 && (
                      <span
                        className="slds-text-3"
                        style={{
                          color: "var(--slds-g-color-text-weak)",
                        }}
                      >
                        +{daySessions.length - 3} more
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── WEEK VIEW: Day column headers ── */}
        {viewMode === "week" && (
          <div
            className="flex flex-shrink-0"
            style={{
              backgroundColor: "var(--slds-g-color-background-alt)",
              borderBottom: "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <div
              style={{
                width: TIME_COL_W,
                flexShrink: 0,
                borderRight: "1px solid var(--slds-g-color-border-base-1)",
              }}
            />
            {weekDays.map((d, i) => {
              const isToday = formatMDY(d) === todayStr
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "8px 4px",
                    borderRight:
                      i < 6
                        ? "1px solid var(--slds-g-color-border-base-1)"
                        : "none",
                  }}
                >
                  <div
                    className="slds-text-3 font-semibold"
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: isToday
                        ? "var(--color-brand-primary)"
                        : "var(--slds-g-color-text-weak)",
                    }}
                  >
                    {DAY_NAMES[d.getDay()].slice(0, 3)}
                  </div>
                  <div
                    style={{
                      fontSize: "22px",
                      fontWeight: 700,
                      lineHeight: 1,
                      color: isToday
                        ? "white"
                        : "var(--slds-g-color-text-default)",
                      backgroundColor: isToday
                        ? "var(--color-brand-primary)"
                        : "transparent",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "4px auto 0",
                    }}
                  >
                    {d.getDate()}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── WEEK VIEW: Scrollable time grid ── */}
        {viewMode === "week" && (
          <div
            ref={gridRef}
            className="flex-1 overflow-y-auto"
            style={{
              position: "relative",
              backgroundColor: "var(--slds-g-color-background-base)",
              scrollbarGutter: "stable",
            }}
          >
            <div style={{ display: "flex", height: TOTAL_PX }}>
              {/* Time labels */}
              <div
                style={{
                  width: TIME_COL_W,
                  flexShrink: 0,
                  position: "relative",
                  borderRight: "1px solid var(--slds-g-color-border-base-1)",
                  backgroundColor: "var(--slds-g-color-background-alt)",
                }}
              >
                {timeLabels.map((label, i) => (
                  <div
                    key={i}
                    className="slds-text-3"
                    style={{
                      position: "absolute",
                      top: i === 0 ? 4 : i * HOUR_PX - 8,
                      right: 8,
                      color: "var(--slds-g-color-text-weak)",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      userSelect: "none",
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
              {/* Day columns */}
              {weekDays.map((d, di) => {
                const daySessions = sessionsForDay(d)
                const isDayToday = formatMDY(d) === todayStr
                return (
                  <div
                    key={di}
                    style={{
                      flex: 1,
                      position: "relative",
                      borderRight:
                        di < 6
                          ? "1px solid var(--slds-g-color-border-base-1)"
                          : "none",
                      backgroundColor: isDayToday
                        ? "#f0faf4"
                        : "var(--slds-g-color-background-base)",
                    }}
                  >
                    {timeLabels.map((_, i) => (
                      <div
                        key={i}
                        style={{
                          position: "absolute",
                          top: i * HOUR_PX,
                          left: 0,
                          right: 0,
                          borderTop: `1px solid var(--slds-g-color-border-base-1)`,
                          opacity: 0.5,
                          pointerEvents: "none",
                        }}
                      />
                    ))}
                    {isDayToday && isCurrentWeek && (
                      <div
                        style={{
                          position: "absolute",
                          top: currentTimeTop,
                          left: 0,
                          right: 0,
                          zIndex: 10,
                          pointerEvents: "none",
                        }}
                      >
                        <div
                          style={{
                            height: "2px",
                            backgroundColor: "#c23934",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              left: -5,
                              top: -4,
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: "#c23934",
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {daySessions.map((s) => {
                      const palette =
                        tutorColorMap.get(s.tutor) ?? EVENT_PALETTE[0]
                      const top = eventTop(s.startTime)
                      const height = eventHeight(s.startTime, s.endTime)
                      const match = matches.find((m) => m.id === s.matchId)
                      return (
                        <button
                          key={s.id}
                          onClick={() => {
                            if (match) {
                              onOpenMatch(match)
                              onClose()
                            }
                          }}
                          style={{
                            position: "absolute",
                            top: top + 1,
                            left: 2,
                            right: 2,
                            height: height - 2,
                            backgroundColor: palette.bg,
                            borderLeft: `3px solid ${palette.border}`,
                            borderRadius: "4px",
                            padding: "3px 6px",
                            textAlign: "left",
                            cursor: "pointer",
                            overflow: "hidden",
                            zIndex: 5,
                            boxShadow: "var(--slds-g-shadow-1)",
                            transition: "filter 0.15s",
                            border: `1px solid ${palette.border}30`,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.filter = "brightness(0.93)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.filter = "brightness(1)")
                          }
                        >
                          <div
                            className="slds-text-3 font-semibold"
                            style={{
                              color: palette.text,
                              lineHeight: 1.3,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {s.startTime} – {s.endTime}
                          </div>
                          {height > 36 && (
                            <div
                              className="slds-text-3"
                              style={{
                                color: palette.text,
                                opacity: 0.85,
                                lineHeight: 1.3,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {s.tutor} : {s.youth}
                            </div>
                          )}
                          {height > 54 && (
                            <div
                              style={{
                                fontSize: "10px",
                                color: palette.text,
                                opacity: 0.65,
                                lineHeight: 1.3,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {s.program} · {s.campus.replace(" Campus", "")}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Upcoming Sessions Panel ──────────────────────────────────────────────────

function UpcomingSessionsPanel({
  sessions,
  onOpenSession,
  onOpenCalendar,
}: {
  sessions: TutorSession[]
  onOpenSession: (s: TutorSession) => void
  onOpenCalendar: () => void
}) {
  const today = formatMDY(new Date())
  const tmr = new Date()
  tmr.setDate(tmr.getDate() + 1)
  const tomorrow = formatMDY(tmr)

  const todaySessions = sessions
    .filter((s) => s.date === today)
    .sort((a, b) => parse12HTime(a.startTime) - parse12HTime(b.startTime))
  const tomorrowSessions = sessions
    .filter((s) => s.date === tomorrow)
    .sort((a, b) => parse12HTime(a.startTime) - parse12HTime(b.startTime))

  // Reference-image style: rounded card row with dot + text left, count + chevron right
  const SessionRow = ({
    s,
    accent,
  }: {
    s: TutorSession
    accent: {
      dot: string
      bg: string
      border: string
      text: string
    }
  }) => (
    <button
      onClick={() => onOpenSession(s)}
      className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all mb-2"
      style={{
        backgroundColor: accent.bg,
        border: `1px solid ${accent.border}`,
        textAlign: "left",
        cursor: "pointer",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.filter = "brightness(0.96)"
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.filter = "brightness(1)"
      }}
    >
      {/* Coloured dot */}
      <div
        className="flex-shrink-0 h-2.5 w-2.5 rounded-full"
        style={{
          backgroundColor: accent.dot,
          marginTop: "1px",
        }}
      />

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: accent.text,
            lineHeight: 1.3,
          }}
        >
          {s.startTime}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: accent.text,
            opacity: 0.75,
            lineHeight: 1.4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {s.tutor} : {s.youth}
        </div>
        <div
          style={{
            fontSize: "10px",
            color: accent.text,
            opacity: 0.55,
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {s.program} · {s.campus.replace(" Campus", "")}
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight
        className="flex-shrink-0 h-4 w-4"
        style={{ color: accent.dot, opacity: 0.6 }}
      />
    </button>
  )

  const todayAccent = {
    dot: "#145F33",
    bg: "#f0faf4",
    border: "#a3d4b5",
    text: "#1b3a2a",
  }
  const tomorrowAccent = {
    dot: "#0176d3",
    bg: "#e8f4fd",
    border: "#b3d4f0",
    text: "#0c3a5c",
  }

  return (
    // Outer padding wrapper — mirrors the table area's px-4 sm:px-6 pt-4 pb-6 spacing
    // On desktop: sits to the right of the table card with matching top/bottom/right breathing room
    null
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TutorModule() {
  // Shared Tutor Match store (US 20093) — not component-local state.
  const tmSnapshot = useTutorMatchSnapshot()
  const matches = useMemo(
    () => listedMatches(tmSnapshot).map(toView),
    [tmSnapshot],
  )

  // Live filters — apply immediately on change (Admissions pattern)
  const [draftYouth, setDraftYouth] = useState("all")
  const [draftTutor, setDraftTutor] = useState("all")
  const [draftCampus, setDraftCampus] = useState("all")
  const [draftProgram, setDraftProgram] = useState("all")
  const [selectedDays, setSelectedDays] = useState<string[]>([]) // multi-select days
  const [isDayPopoverOpen, setIsDayPopoverOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<string>("")
  const [appliedFilters, setAppliedFilters] = useState({
    youth: "all",
    tutor: "all",
    campus: "all",
    program: "all",
    fundingType: "all",
    days: [] as string[],
  })

  // Table search
  const [search, setSearch] = useState("")

  // Modals
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false)
  const [editingMatch, setEditingMatch] = useState<TutorMatch | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const toggleDay = (day: string) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day]
    setSelectedDays(next)
    setAppliedFilters((f) => ({ ...f, days: next }))
  }

  const clearFilters = () => {
    setDraftYouth("all")
    setDraftTutor("all")
    setDraftCampus("all")
    setDraftProgram("all")
    setSelectedDays([])
    setAppliedFilters({
      youth: "all",
      tutor: "all",
      campus: "all",
      program: "all",
      fundingType: "all",
      days: [],
    })
    setSearch("")
    setSelectedPeriod("")
  }

  const hasFilters =
    appliedFilters.youth !== "all" ||
    appliedFilters.tutor !== "all" ||
    appliedFilters.campus !== "all" ||
    appliedFilters.program !== "all" ||
    appliedFilters.days.length > 0 ||
    !!search ||
    !!selectedPeriod

  // Filtered matches for table
  const filteredMatches = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    let periodStart: Date | null = null
    let periodEnd: Date | null = null
    if (selectedPeriod) {
      const sun = getWeekStart(now)
      if (selectedPeriod === "This Week") {
        periodStart = new Date(sun)
        periodEnd = new Date(sun)
        periodEnd.setDate(sun.getDate() + 6)
      } else if (selectedPeriod === "Last Week") {
        periodEnd = new Date(sun)
        periodEnd.setDate(sun.getDate() - 1)
        periodStart = new Date(sun)
        periodStart.setDate(sun.getDate() - 7)
      } else if (selectedPeriod === "Next Week") {
        periodStart = new Date(sun)
        periodStart.setDate(sun.getDate() + 7)
        periodEnd = new Date(sun)
        periodEnd.setDate(sun.getDate() + 13)
      } else if (selectedPeriod === "This Month") {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      } else if (selectedPeriod === "Last Month") {
        periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        periodEnd = new Date(now.getFullYear(), now.getMonth(), 0)
      }
    }
    return matches.filter((m) => {
      const q = search.toLowerCase()
      const ms =
        !search ||
        m.tutor.toLowerCase().includes(q) ||
        m.youth.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.program.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q)
      const matchDay =
        appliedFilters.days.length === 0 ||
        appliedFilters.days.some((d) => m.days.includes(d as WeekDay))
      const matchPeriod = (() => {
        if (!periodStart || !periodEnd) return true
        const mStart = parseMDY(m.startDate)
        const mEnd = parseMDY(m.endDate)
        if (!mStart || !mEnd) return false
        return mStart <= periodEnd && mEnd >= periodStart
      })()
      return (
        ms &&
        matchDay &&
        matchPeriod &&
        (appliedFilters.youth === "all" || m.youth === appliedFilters.youth) &&
        (appliedFilters.tutor === "all" || m.tutor === appliedFilters.tutor) &&
        (appliedFilters.campus === "all" ||
          m.campus === appliedFilters.campus) &&
        (appliedFilters.program === "all" ||
          m.program === appliedFilters.program)
      )
    })
  }, [matches, search, appliedFilters, selectedPeriod])

  const TM_PAGE_SIZE = 12
  const [tmPage, setTmPage] = useState(1)
  const tmTotalPages = Math.max(
    1,
    Math.ceil(filteredMatches.length / TM_PAGE_SIZE),
  )
  const tmSafePage = Math.min(tmPage, tmTotalPages)
  const tmPageStart = (tmSafePage - 1) * TM_PAGE_SIZE
  const tmPageRows = filteredMatches.slice(
    tmPageStart,
    tmPageStart + TM_PAGE_SIZE,
  )

  React.useEffect(() => {
    setTmPage(1)
  }, [search, appliedFilters, selectedPeriod])

  // Generate sessions for Upcoming panel (affected by filters)
  const upcomingSessions = useMemo(() => {
    const from = new Date()
    from.setHours(0, 0, 0, 0)
    const to = new Date(from)
    to.setDate(to.getDate() + 1)
    return generateSessions(filteredMatches, from, to)
  }, [filteredMatches])

  // KPIs
  const totalMatches = matches.length
  const title1Count = matches.filter((m) => m.fundingType === "Title 1").length
  const now = new Date()
  const weekFrom = getWeekStart(now)
  const weekTo = new Date(weekFrom)
  weekTo.setDate(weekTo.getDate() + 6)
  const thisWeekSessions = generateSessions(matches, weekFrom, weekTo).length
  const todaySessions = generateSessions(matches, now, now).length

  const openNew = () => {
    setEditingMatch(null)
    setIsMatchModalOpen(true)
  }
  const openEdit = (m: TutorMatch) => {
    setEditingMatch(m)
    setIsMatchModalOpen(true)
  }

  const openSessionMatch = (s: TutorSession) => {
    const m = matches.find((x) => x.id === s.matchId)
    if (m) {
      setEditingMatch(m)
      setIsMatchModalOpen(true)
    }
  }

  // One transaction: Match + Tutor Session Connection + sessions.
  const saveMatch = (m: TutorMatchInput): SaveResult => {
    const r = saveTutorMatch(m)
    if (!r.ok) {
      if (r.diagnostic)
        toast.error("Tutor match not saved", {
          description: `The match and its Tutor Session connection could not be saved, so nothing was changed. Try again; if it persists, share reference ${r.diagnostic.errorId}.`,
        })
      return r
    }
    if (r.outcome === "unchanged") toast.info("No changes to save.")
    else
      toast.success(
        r.outcome === "created"
          ? "Tutor match created."
          : "Tutor match updated.",
        {
          description: r.openEnded
            ? "Tutor Session connection created. No sessions were scheduled because the match has no End Date."
            : `Tutor Session connection and ${r.sessionCount} scheduled session${
                r.sessionCount === 1 ? "" : "s"
              } saved.`,
        },
      )
    return r
  }

  // AC7 & AC8: only show youth/tutors that appear in at least one match
  const activeYouthInMatches = useMemo(
    () => [...new Set(matches.map((m) => m.youth))].sort(),
    [matches],
  )
  const activeTutorsInMatches = useMemo(
    () => [...new Set(matches.map((m) => m.tutor))].sort(),
    [matches],
  )

  const selectSty: React.CSSProperties = {
    height: "32px",
    padding: "0 10px",
    borderRadius: "9999px",
    border: "1px solid var(--slds-g-color-border-base-1)",
    backgroundColor: "var(--slds-g-color-background-base)",
    fontSize: "13px",
    color: "var(--slds-g-color-text-default)",
    cursor: "pointer",
    outline: "none",
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: "var(--slds-g-color-background-alt-2)",
      }}
    >
      {/* ── Page Header ── */}
      <div
        className="px-4 sm:px-6 py-4"
        style={{
          backgroundColor: "var(--slds-g-color-background-alt-2)",
          borderBottom: "1px solid var(--slds-g-color-border-base-1)",
          boxShadow: "var(--slds-g-shadow-1)",
        }}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 flex items-center justify-center text-white"
              style={{
                borderRadius: "var(--slds-c-card-radius-border)",
                backgroundColor: "var(--color-brand-primary)",
                boxShadow: "var(--slds-g-shadow-1)",
              }}
            >
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div
                className="text-xs font-medium uppercase tracking-wide"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Dashboard
              </div>
              <h1
                className="text-2xl font-medium tracking-tight"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              >
                Tutor Matches
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              style={{
                backgroundColor: "white",
                borderRadius: "50%",
              }}
              onClick={() => window.location.reload()}
            >
              <RefreshCw
                className="h-4 w-4"
                style={{
                  color: "var(--slds-g-color-text-default)",
                }}
              />
            </Button>
            {/* Divider */}
            <div
              className="h-6 w-px mx-1"
              style={{
                backgroundColor: "var(--slds-g-color-border-base-1)",
              }}
            />
            <Button
              size="sm"
              className="h-8 px-3 rounded-full text-white flex items-center gap-1.5"
              style={{
                backgroundColor: "var(--color-brand-primary)",
                fontSize: "13px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#0e4524")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--color-brand-primary)")
              }
              onClick={openNew}
            >
              <Plus className="h-3.5 w-3.5" /> New Tutor Match
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main content: table + sidebar ── */}
      <div className="flex min-h-0 overflow-hidden flex-col lg:flex-row">
        {/* Table area. Extra bottom padding clears the fixed 40px UtilityBar
            (To Do List / History / Notes), which overlays the bottom of the
            viewport, so the table's last rows and footer are never hidden
            behind it — same approach as ProgramRecordPage. */}
        <div
          className="w-full min-w-0 overflow-y-auto px-4 sm:px-6 pb-16 pt-4"
          style={{
            backgroundColor: "var(--slds-g-color-background-alt-2)",
          }}
        >
          <Card
            className="w-full shadow-sm overflow-hidden !gap-0"
            style={{
              backgroundColor: "var(--slds-g-color-background-base)",
              border: "1px solid var(--slds-g-color-border-base-1)",
              borderRadius: "12px",
            }}
          >
            {/* Card header: title left, filters right (Admissions pattern) */}
            <CardHeader separated className="px-6 !py-0">
              <div className="min-h-[50px] py-2.5 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <span
                    className="text-base font-bold"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    Tutor Matches ({filteredMatches.length})
                  </span>
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="h-9 px-3 rounded-full flex items-center gap-1.5 transition-colors"
                      style={{
                        border: "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "var(--slds-g-color-background-base)",
                        fontSize: "12px",
                        color: "var(--slds-g-color-text-default)",
                        cursor: "pointer",
                      }}
                    >
                      <X className="h-3 w-3" /> Clear Filters
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Youth — live filter (Admissions pattern) */}
                  <Select
                    value={draftYouth}
                    onValueChange={(v) => {
                      setDraftYouth(v)
                      setAppliedFilters((f) => ({
                        ...f,
                        youth: v,
                      }))
                    }}
                  >
                    <SelectTrigger
                      className="h-9 w-[130px] text-[13px]"
                      style={{
                        border: "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "var(--slds-g-color-background-base)",
                        borderRadius: "var(--slds-c-input-radius-border)",
                      }}
                    >
                      <SelectValue placeholder="Youth" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Youth</SelectItem>
                      {activeYouthInMatches.map((y) => (
                        <SelectItem key={y} value={y}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Tutor */}
                  <Select
                    value={draftTutor}
                    onValueChange={(v) => {
                      setDraftTutor(v)
                      setAppliedFilters((f) => ({
                        ...f,
                        tutor: v,
                      }))
                    }}
                  >
                    <SelectTrigger
                      className="h-9 w-[130px] text-[13px]"
                      style={{
                        border: "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "var(--slds-g-color-background-base)",
                        borderRadius: "var(--slds-c-input-radius-border)",
                      }}
                    >
                      <SelectValue placeholder="Tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tutors</SelectItem>
                      {activeTutorsInMatches.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Campus */}
                  <Select
                    value={draftCampus}
                    onValueChange={(v) => {
                      setDraftCampus(v)
                      setAppliedFilters((f) => ({
                        ...f,
                        campus: v,
                      }))
                    }}
                  >
                    <SelectTrigger
                      className="h-9 w-[140px] text-[13px]"
                      style={{
                        border: "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "var(--slds-g-color-background-base)",
                        borderRadius: "var(--slds-c-input-radius-border)",
                      }}
                    >
                      <SelectValue placeholder="Campus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Campuses</SelectItem>
                      {FILTER_CAMPUSES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Program */}
                  <Select
                    value={draftProgram}
                    onValueChange={(v) => {
                      setDraftProgram(v)
                      setAppliedFilters((f) => ({
                        ...f,
                        program: v,
                      }))
                    }}
                  >
                    <SelectTrigger
                      className="h-9 w-[135px] text-[13px]"
                      style={{
                        border: "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "var(--slds-g-color-background-base)",
                        borderRadius: "var(--slds-c-input-radius-border)",
                      }}
                    >
                      <SelectValue placeholder="Program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Programs</SelectItem>
                      {PROGRAMS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Day(s) — multi-select popover */}
                  <div className="relative">
                    <button
                      onClick={() => setIsDayPopoverOpen((o) => !o)}
                      className="h-9 px-3 text-[13px] flex items-center gap-1.5 transition-colors"
                      style={{
                        border: `1px solid ${
                          selectedDays.length > 0
                            ? "var(--color-brand-primary)"
                            : "var(--slds-g-color-border-base-1)"
                        }`,
                        backgroundColor:
                          selectedDays.length > 0
                            ? "#f0faf4"
                            : "var(--slds-g-color-background-base)",
                        color:
                          selectedDays.length > 0
                            ? "#145F33"
                            : "var(--slds-g-color-text-default)",
                        minWidth: "120px",
                        cursor: "pointer",
                        borderRadius: "var(--slds-c-input-radius-border)",
                      }}
                    >
                      <span className="flex-1 text-left truncate">
                        {selectedDays.length === 0
                          ? "Day(s)"
                          : selectedDays.length === 1
                            ? selectedDays[0].slice(0, 3)
                            : `${selectedDays.length} Days`}
                      </span>
                      <ChevronRight className="h-3 w-3 rotate-90 flex-shrink-0 opacity-50" />
                    </button>

                    {isDayPopoverOpen && (
                      <div
                        className="absolute top-full mt-1 left-0 z-50 rounded-lg shadow-lg overflow-hidden"
                        style={{
                          backgroundColor:
                            "var(--slds-g-color-background-base)",
                          border: "1px solid var(--slds-g-color-border-base-1)",
                          minWidth: "150px",
                        }}
                      >
                        <div
                          className="px-3 py-2"
                          style={{
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              color: "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Select Days
                          </span>
                        </div>
                        {EDITABLE_DAYS.map((day) => {
                          const checked = selectedDays.includes(day)
                          return (
                            <button
                              key={day}
                              onClick={() => toggleDay(day)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 transition-colors"
                              style={{
                                fontSize: "13px",
                                color: checked
                                  ? "#145F33"
                                  : "var(--slds-g-color-text-default)",
                                backgroundColor: checked
                                  ? "#f0faf4"
                                  : "transparent",
                                border: "none",
                                cursor: "pointer",
                                textAlign: "left",
                                borderBottom:
                                  "1px solid var(--slds-g-color-border-base-1)",
                              }}
                              onMouseEnter={(e) => {
                                if (!checked)
                                  (e.currentTarget as HTMLElement).style.backgroundColor =
                                    "var(--slds-g-color-background-alt-2)"
                              }}
                              onMouseLeave={(e) => {
                                if (!checked)
                                  (e.currentTarget as HTMLElement).style.backgroundColor =
                                    "transparent"
                              }}
                            >
                              <div
                                className="h-4 w-4 rounded flex items-center justify-center flex-shrink-0"
                                style={{
                                  border: `1.5px solid ${
                                    checked
                                      ? "#145F33"
                                      : "var(--slds-g-color-border-base-1)"
                                  }`,
                                  backgroundColor: checked
                                    ? "#145F33"
                                    : "transparent",
                                }}
                              >
                                {checked && (
                                  <Check className="h-2.5 w-2.5 text-white" />
                                )}
                              </div>
                              {day}
                            </button>
                          )
                        })}
                        {selectedDays.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedDays([])
                              setAppliedFilters((f) => ({
                                ...f,
                                days: [],
                              }))
                            }}
                            className="w-full px-3 py-2 text-left transition-colors"
                            style={{
                              fontSize: "12px",
                              color: "#c23934",
                              backgroundColor: "transparent",
                              border: "none",
                              cursor: "pointer",
                              borderTop:
                                "1px solid var(--slds-g-color-border-base-1)",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#fef2f2")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            Clear selection
                          </button>
                        )}
                        <button
                          onClick={() => setIsDayPopoverOpen(false)}
                          className="w-full px-3 py-2 text-center transition-colors"
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#145F33",
                            backgroundColor:
                              "var(--slds-g-color-background-alt)",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          Done
                        </button>
                      </div>
                    )}

                    {/* Click-outside to close */}
                    {isDayPopoverOpen && (
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDayPopoverOpen(false)}
                      />
                    )}
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 z-10"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search"
                      className="pl-9 pr-9 h-9 w-40 text-[13px]"
                      style={{
                        border: "1px solid var(--slds-g-color-border-base-1)",
                        backgroundColor: "var(--slds-g-color-background-base)",
                        borderRadius: "var(--slds-c-input-radius-border)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor =
                          "var(--color-brand-primary)"
                        e.currentTarget.style.outline =
                          "2px solid var(--color-brand-primary)"
                        e.currentTarget.style.outlineOffset = "0"
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor =
                          "var(--slds-g-color-border-base-1)"
                        e.currentTarget.style.outline = "none"
                      }}
                      aria-label="Search tutor matches"
                    />
                    {search && (
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
                        onClick={() => setSearch("")}
                      >
                        <X
                          className="h-3 w-3"
                          style={{
                            color: "var(--slds-g-color-text-weak)",
                          }}
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Period filter row */}
              <div
                className="h-[44px] flex items-center gap-[6px] !py-0"
                style={{
                  borderTop: "1px solid var(--slds-g-color-border-base-1)",
                  paddingTop: "10px",
                }}
              >
                <span
                  className="slds-text-3 shrink-0 pr-1"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  Period:
                </span>
                {([
                  "Last Month",
                  "Last Week",
                  "This Week",
                  "Next Week",
                  "This Month",
                  "Ongoing",
                ] as const).map((period) => {
                  const active = selectedPeriod === period
                  return (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(active ? "" : period)}
                      className="h-[28px] px-3 rounded-full shrink-0 slds-text-3 transition-colors"
                      style={{
                        border: `1px solid ${
                          active
                            ? "#145F33"
                            : "var(--slds-g-color-border-base-1)"
                        }`,
                        backgroundColor: active
                          ? "#e6f2eb"
                          : "var(--slds-g-color-background-base)",
                        color: active
                          ? "#145F33"
                          : "var(--slds-g-color-text-default)",
                        cursor: "pointer",
                        fontWeight: 510,
                        lineHeight: "18px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {period}
                    </button>
                  )
                })}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="w-full" style={{ minWidth: "900px" }}>
                  <TableHeader
                    className="sticky top-0 z-10"
                    style={{
                      backgroundColor: "var(--slds-g-color-background-alt)",
                    }}
                  >
                    <TableRow
                      className="hover:bg-transparent"
                      style={{
                        borderBottom:
                          "1px solid var(--slds-g-color-border-base-1)",
                      }}
                    >
                      {[
                        "TUTOR",
                        "YOUTH",
                        "START DATE",
                        "END DATE",
                        "START TIME",
                        "END TIME",
                        "DAY(S)",
                        "PROGRAM",
                        "CAMPUS",
                        "LOCATION",
                        "ACTIONS",
                      ].map((h, i, arr) => (
                        <TableHead
                          key={h}
                          className={`h-10 whitespace-nowrap${
                            i === 0
                              ? " pl-6"
                              : i === arr.length - 1
                                ? " text-right pr-6"
                                : " px-2"
                          }`}
                          style={{
                            color: "var(--slds-g-color-text-weak)",
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: "0.04em",
                          }}
                        >
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMatches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="py-16 text-center">
                          <Search
                            className="h-8 w-8 mx-auto mb-2"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                            }}
                          />
                          <p
                            className="text-sm font-medium"
                            style={{
                              color: "var(--slds-g-color-text-default)",
                            }}
                          >
                            No tutor matches found
                          </p>
                          <p
                            className="text-xs mt-1"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                            }}
                          >
                            Adjust your search or filters
                          </p>
                          {hasFilters && (
                            <button
                              className="mt-2 text-xs underline"
                              style={{ color: "#145F33" }}
                              onClick={clearFilters}
                            >
                              Clear filters
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    ) : (
                      tmPageRows.map((m) => (
                        <TableRow
                          key={m.id}
                          className="transition-colors h-[53px]"
                          style={{
                            borderBottom:
                              "1px solid var(--slds-g-color-border-base-1)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--slds-g-color-background-row-hover)"
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent"
                          }}
                        >
                          {/* Tutor — Name column, kept as-is */}
                          <TableCell
                            wrap
                            className="pl-6 pr-2 py-3 text-sm font-medium"
                            style={{
                              color: "var(--slds-g-color-text-default)",
                            }}
                          >
                            {m.tutor}
                          </TableCell>
                          <TableCell
                            className="px-2 py-3 text-sm whitespace-nowrap"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {m.youth}
                          </TableCell>
                          <TableCell
                            className="px-2 py-3 text-sm whitespace-nowrap"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {m.startDate}
                          </TableCell>
                          <TableCell
                            className="px-2 py-3 text-sm whitespace-nowrap"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {m.endDate}
                          </TableCell>
                          <TableCell
                            className="px-2 py-3 text-sm whitespace-nowrap"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {m.startTime}
                          </TableCell>
                          <TableCell
                            className="px-2 py-3 text-sm whitespace-nowrap"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {m.endTime}
                          </TableCell>
                          <TableCell
                            className="px-2 py-3"
                            style={{ maxWidth: "120px" }}
                          >
                            <span
                              className="text-xs"
                              style={{
                                color: "var(--slds-g-color-text-weak)",
                              }}
                            >
                              {m.days.map((d) => d.slice(0, 3)).join(", ")}
                            </span>
                          </TableCell>
                          <TableCell
                            wrap
                            className="px-2 py-3 text-sm"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {m.program || "—"}
                          </TableCell>
                          <TableCell wrap className="px-2 py-3">
                            <span
                              className="text-xs"
                              style={{
                                color: "var(--slds-g-color-text-weak)",
                              }}
                            >
                              {m.campus}
                            </span>
                          </TableCell>
                          <TableCell
                            wrap
                            className="px-2 py-3 text-xs"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                              maxWidth: "140px",
                            }}
                          >
                            <span className="line-clamp-2" title={m.location}>
                              {m.location}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6 py-3">
                            <button
                              title="Edit"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEdit(m)
                              }}
                              className="p-1.5 rounded transition-colors"
                              style={{
                                color: "#145F33",
                                backgroundColor: "transparent",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#e6f2eb")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "transparent")
                              }
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination */}
              <div
                className="flex items-center justify-between"
                style={{
                  borderTop: "1px solid var(--slds-g-color-border-base-1)",
                  padding: "12px 24px",
                }}
              >
                {tmTotalPages > 1 ? (
                  <TablePaginationBar
                    className="w-full"
                    start={tmPageStart + 1}
                    end={tmPageStart + tmPageRows.length}
                    total={filteredMatches.length}
                    countLabel="records"
                    currentPage={tmSafePage}
                    totalPages={tmTotalPages}
                    onPrevious={() => setTmPage(tmSafePage - 1)}
                    onNext={() => setTmPage(tmSafePage + 1)}
                  />
                ) : (
                  <PaginationInfo
                    start={filteredMatches.length === 0 ? 0 : tmPageStart + 1}
                    end={tmPageStart + tmPageRows.length}
                    total={filteredMatches.length}
                    label="records"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Sessions sidebar — right side */}
        <UpcomingSessionsPanel
          sessions={upcomingSessions}
          onOpenSession={openSessionMatch}
          onOpenCalendar={() => setIsCalendarOpen(true)}
        />
      </div>

      {/* Modals */}
      <TutorMatchModal
        open={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        editing={editingMatch}
        onSave={saveMatch}
      />
      <DigitalCalendarModal
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        matches={filteredMatches}
        onOpenMatch={(m) => {
          setEditingMatch(m)
          setIsMatchModalOpen(true)
        }}
      />
    </div>
  )
}
