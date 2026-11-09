import React, { useMemo, useState } from "react"
import {
  Check,
  ChevronRight,
  Heart,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  X,
} from "@/app/lib/lucide-icons"
import { toast } from "sonner"
import { useNavigate } from "react-router"
import { Alert, AlertDescription } from "../ui/alert"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
import { DateInput } from "../ui/date-input"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { SearchableSelect } from "../ui/searchable-select"
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
import { Textarea } from "../ui/textarea"
import { PaginationInfo } from "../ui/pagination"
import { TablePaginationBar } from "../ui/table-toolbar"
import { TimeInput } from "../ui/time-input"
import {
  SUB_PROGRAMMES,
  type FFSubProgramme,
} from "../../data/mockFriendsFirstData"
import {
  MENTOR_MATCH_DAYS,
  approvedMentees,
  getMentorMatches,
  isMenteeMatchable,
  menteeName,
  mentorName,
  subscribeMentorMatches,
  updateMentorMatch,
  type MentorMatch,
  type MentorMatchDay,
} from "../../data/mockMentorMatchData"
import {
  autoMatchSubProgram,
  createMentorMatchForCandidate,
  getFFMentorCandidate,
  isFFMentorMatchCandidate,
  listFFMentorCandidates,
} from "../../data/ffMentorCandidates"

// ─── Date / time helpers ───────────────────────────────────────────────────

function parseMDY(s: string): Date | null {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  const d = new Date(+m[3], +m[1] - 1, +m[2])
  return Number.isNaN(d.getTime()) ? null : d
}

/** Minutes since midnight for "h:mm AM/PM"; null when incomplete. */
function parseTime(t: string): number | null {
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!m) return null
  let h = +m[1] % 12
  if (m[3].toUpperCase() === "PM") h += 12
  return h * 60 + +m[2]
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekStart(d: Date): Date {
  const dt = new Date(d)
  dt.setDate(dt.getDate() - dt.getDay())
  dt.setHours(0, 0, 0, 0)
  return dt
}

// ─── Period filter ─────────────────────────────────────────────────────────
// Same windows as Tutor Matches; a match is in a window when its date range
// overlaps it. Ongoing = the match's End Date has not passed yet.

const PERIODS = [
  "Last Month",
  "Last Week",
  "This Week",
  "Next Week",
  "This Month",
  "Ongoing",
] as const
type Period = typeof PERIODS[number]

function periodWindow(period: Exclude<Period, "Ongoing">): [Date, Date] {
  const now = startOfToday()
  const sun = getWeekStart(now)
  const shift = (base: Date, days: number) => {
    const d = new Date(base)
    d.setDate(d.getDate() + days)
    return d
  }
  switch (period) {
    case "Last Week":
      return [shift(sun, -7), shift(sun, -1)]
    case "This Week":
      return [sun, shift(sun, 6)]
    case "Next Week":
      return [shift(sun, 7), shift(sun, 13)]
    case "Last Month":
      return [
        new Date(now.getFullYear(), now.getMonth() - 1, 1),
        new Date(now.getFullYear(), now.getMonth(), 0),
      ]
    case "This Month":
      return [
        new Date(now.getFullYear(), now.getMonth(), 1),
        new Date(now.getFullYear(), now.getMonth() + 1, 0),
      ]
  }
}

function inPeriod(m: MentorMatch, period: Period | ""): boolean {
  if (!period) return true
  const start = parseMDY(m.startDate)
  const end = parseMDY(m.endDate)
  // A match with no End Date is open-ended: it never ends.
  if (!start) return false
  if (period === "Ongoing") return !end || end >= startOfToday()
  const [from, to] = periodWindow(period)
  return start <= to && (!end || end >= from)
}

// ─── Form validation (shared by New and Edit) ──────────────────────────────

interface MentorMatchForm {
  menteeId: string
  mentorId: string
  /** New matches: the chosen qualifying sub-program ("" = not chosen). */
  subProgram: FFSubProgramme | ""
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  days: MentorMatchDay[]
  comment: string
}

const EMPTY_FORM: MentorMatchForm = {
  menteeId: "",
  mentorId: "",
  subProgram: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  days: [],
  comment: "",
}

const MSG_START_PAST = "You are creating a Match with a Start Date in the past."
const MSG_END_DATE = "End Date should not be earlier than the Start Date."
// Exact wording required by US 20001.
const MSG_END_TIME = "End Time should be later than the Start Date."

/** Live date/time rules — shown as soon as the values change. */
function liveChecks(f: MentorMatchForm) {
  const start = parseMDY(f.startDate)
  const end = parseMDY(f.endDate)
  const startT = parseTime(f.startTime)
  const endT = parseTime(f.endTime)
  return {
    startInPast: !!start && start < startOfToday(),
    endDateError: !!start && !!end && end < start ? MSG_END_DATE : "",
    // Chronology uses date and time together: an earlier clock time is only
    // an error on the same day (a later end date may end earlier in the
    // day). Without both dates the clock-only live warning is unchanged.
    endTimeError:
      !!end &&
      startT !== null &&
      endT !== null &&
      endT < startT &&
      (!start || !end || end.getTime() === start.getTime())
        ? MSG_END_TIME
        : "",
  }
}

function requiredErrors(f: MentorMatchForm): Record<string, string> {
  const e: Record<string, string> = {}
  if (!f.menteeId) e.menteeId = "Mentee is required."
  if (!f.mentorId) e.mentorId = "Mentor is required."
  if (!parseMDY(f.startDate)) e.startDate = "Start Date is required."
  if (parseTime(f.startTime) === null) e.startTime = "Start Time is required."
  // End Date is optional; End Time is only needed once an End Date is set.
  if (f.endDate.trim() && !parseMDY(f.endDate))
    e.endDate = "Enter a valid End Date (MM/DD/YYYY)."
  if (parseMDY(f.endDate) && parseTime(f.endTime) === null)
    e.endTime = "End Time is required."
  return e
}

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="slds-form-label block mb-1.5 text-[var(--slds-g-color-text-weak)]"
    >
      {children}
      {required && <span className="text-[#c23934]"> *</span>}
    </label>
  )
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="slds-text-3 mt-1 text-[#c23934]">
      {message}
    </p>
  )
}

// ─── Mentor Match modal (New + Edit) ───────────────────────────────────────

function MentorMatchModal({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean
  editing: MentorMatch | null
  onClose: () => void
  onSaved: (m: MentorMatch, isNew: boolean) => void
}) {
  const [form, setForm] = useState<MentorMatchForm>(EMPTY_FORM)
  const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({})

  React.useEffect(() => {
    if (!open) return
    setForm(
      editing
        ? {
            menteeId: editing.menteeId,
            mentorId: editing.mentorId,
            subProgram: editing.subProgram,
            startDate: editing.startDate,
            startTime: editing.startTime,
            endDate: editing.endDate,
            endTime: editing.endTime,
            days: [...editing.days],
            comment: editing.comment,
          }
        : EMPTY_FORM,
    )
    setSubmitErrors({})
  }, [open, editing])

  const set = <K extends keyof MentorMatchForm,>(
    key: K,
    value: MentorMatchForm[K],
  ) => {
    setForm((f) => ({ ...f, [key]: value }))
    setSubmitErrors((e) => ({ ...e, [key]: "" }))
  }

  const toggleFormDay = (day: MentorMatchDay) =>
    set(
      "days",
      form.days.includes(day)
        ? form.days.filter((d) => d !== day)
        : MENTOR_MATCH_DAYS.filter((d) => d === day || form.days.includes(d)),
    )

  const live = liveChecks(form)
  // New-match mentors come from the shared candidate selector (eligible,
  // Ready for Match, not Inactive) — US 20039.
  const mentorOptions = listFFMentorCandidates().map((m) => ({
    value: m.mentorId,
    label: m.name,
  }))
  // Editing a historical match whose mentor is no longer a candidate: keep
  // that mentor selectable so the record stays readable.
  if (editing && !mentorOptions.some((o) => o.value === editing.mentorId))
    mentorOptions.unshift({
      value: editing.mentorId,
      label: `${mentorName(editing.mentorId)} (not available for new matches)`,
    })
  const menteeOptions = approvedMentees().map((m) => ({
    value: m.id,
    label: m.name,
  }))
  // Editing a historical match whose mentee is now Inactive: keep that
  // mentee selectable so the record stays readable (US 20040).
  if (editing && !menteeOptions.some((o) => o.value === editing.menteeId))
    menteeOptions.unshift({
      value: editing.menteeId,
      label: `${menteeName(editing.menteeId)} (Inactive)`,
    })

  const handleSave = () => {
    const errs = requiredErrors(form)
    if (!editing && !form.subProgram)
      errs.subProgram = "Sub-Program is required."
    setSubmitErrors(errs)
    if (Object.keys(errs).length > 0 || live.endDateError || live.endTimeError)
      return
    // Recheck against the latest mentee record: the mentee may have been
    // marked Inactive after this modal opened (US 20040). An unchanged
    // mentee on an existing match is allowed (historical record).
    const menteeChanged = !editing || editing.menteeId !== form.menteeId
    if (menteeChanged && !isMenteeMatchable(form.menteeId)) {
      setSubmitErrors({
        menteeId: "This mentee is Inactive or not ready for a new match.",
      })
      toast.error("Mentor match not saved", {
        description: `${menteeName(form.menteeId)} is not available for a new match.`,
      })
      return
    }
    const record = {
      mentorId: form.mentorId,
      menteeId: form.menteeId,
      // Existing matches keep their recorded sub-program.
      subProgram: (editing
        ? editing.subProgram
        : form.subProgram) as FFSubProgramme,
      startDate: form.startDate,
      startTime: form.startTime,
      // No End Date = open-ended match; a lone End Time isn't kept.
      endDate: form.endDate.trim(),
      endTime: parseMDY(form.endDate) ? form.endTime : "",
      days: MENTOR_MATCH_DAYS.filter((d) => form.days.includes(d)),
      comment: form.comment.trim(),
    }
    // Recheck the mentor against current data: they may have become
    // Inactive or ineligible after this modal opened (US 20039). An
    // unchanged mentor on an existing match is allowed (historical record).
    const mentorChanged = !editing || editing.mentorId !== form.mentorId
    if (mentorChanged && !isFFMentorMatchCandidate(form.mentorId)) {
      setSubmitErrors({
        mentorId:
          "This mentor is Inactive or doesn't meet the matching requirements.",
      })
      toast.error("Mentor match not saved", {
        description: `${mentorName(form.mentorId)} is not available for a new match.`,
      })
      return
    }
    if (editing) {
      // The save itself rechecks Inactive closures on current data.
      const r = updateMentorMatch({ ...editing, ...record })
      if (!r.ok) {
        setSubmitErrors({ endDate: r.message })
        toast.error("Mentor match not saved", {
          description: r.message,
        })
        return
      }
      onSaved(r.match, false)
    } else {
      const created = createMentorMatchForCandidate(record)
      if (!created.ok) {
        setSubmitErrors(
          created.reason === "sub-program"
            ? {
                subProgram:
                  "This sub-program isn't on one of the mentor's qualifying applications.",
              }
            : created.reason === "save"
              ? { mentorId: created.message }
              : {
                  mentorId:
                    "This mentor is Inactive or doesn't meet the matching requirements.",
                },
        )
        if (created.reason === "save")
          toast.error("Mentor match not saved", {
            description: created.message,
          })
        return
      }
      onSaved(created.match, true)
    }
  }

  const err = (key: string) => submitErrors[key] || undefined

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent size="lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Mentor Match" : "New Mentor Match"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? `${mentorName(editing.mentorId)} – ${menteeName(editing.menteeId)}`
              : "Create a new mentor-to-mentee match record"}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4 bg-white">
          {/* Mentee / Mentor — read-only once the match exists */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel htmlFor="mm-mentee" required={!editing}>
                Mentee
              </FieldLabel>
              <SearchableSelect
                id="mm-mentee"
                value={form.menteeId}
                onValueChange={(v) => set("menteeId", v)}
                options={menteeOptions}
                searchPlaceholder="Search mentees…"
                disabled={!!editing}
                aria-invalid={!!err("menteeId")}
                aria-describedby="mm-mentee-error"
              />
              <FieldError id="mm-mentee-error" message={err("menteeId")} />
            </div>
            <div>
              <FieldLabel htmlFor="mm-mentor" required={!editing}>
                Mentor
              </FieldLabel>
              <SearchableSelect
                id="mm-mentor"
                value={form.mentorId}
                onValueChange={(v) => {
                  set("mentorId", v)
                  // Auto-select only when exactly one qualifying
                  // sub-program exists; otherwise it must be chosen.
                  set(
                    "subProgram",
                    autoMatchSubProgram(getFFMentorCandidate(v)) ?? "",
                  )
                }}
                options={mentorOptions}
                searchPlaceholder="Search mentors…"
                disabled={!!editing}
                aria-invalid={!!err("mentorId")}
                aria-describedby="mm-mentor-error"
              />
              <FieldError id="mm-mentor-error" message={err("mentorId")} />
            </div>
          </div>

          {/* Sub-Program: one of the mentor's qualifying sub-programs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel htmlFor="mm-subprogram" required={!editing}>
                Sub-Program
              </FieldLabel>
              {editing ? (
                <Input id="mm-subprogram" value={editing.subProgram} readOnly />
              ) : (
                <Select
                  value={form.subProgram}
                  onValueChange={(v) => set("subProgram", v as FFSubProgramme)}
                  disabled={!form.mentorId}
                >
                  <SelectTrigger
                    id="mm-subprogram"
                    aria-invalid={!!err("subProgram")}
                    aria-describedby="mm-subprogram-error"
                  >
                    <SelectValue
                      placeholder={
                        form.mentorId
                          ? "Please Select"
                          : "Select a mentor first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      getFFMentorCandidate(form.mentorId)?.subProgrammes ?? []
                    ).map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FieldError
                id="mm-subprogram-error"
                message={err("subProgram")}
              />
            </div>
          </div>

          {/* Start / End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel htmlFor="mm-start-date" required>
                Start Date
              </FieldLabel>
              <DateInput
                id="mm-start-date"
                value={form.startDate}
                onChange={(v) => set("startDate", v)}
                required
              />
              <FieldError message={err("startDate")} />
            </div>
            <div>
              <FieldLabel htmlFor="mm-end-date">End Date</FieldLabel>
              <DateInput
                id="mm-end-date"
                value={form.endDate}
                onChange={(v) => set("endDate", v)}
              />
              <FieldError message={err("endDate") ?? live.endDateError} />
            </div>
          </div>
          {live.startInPast && (
            <Alert variant="warning">
              <AlertDescription>{MSG_START_PAST}</AlertDescription>
            </Alert>
          )}

          {/* Start / End Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <FieldLabel htmlFor="mm-start-time" required>
                Start Time
              </FieldLabel>
              <TimeInput
                className="bg-white"
                id="mm-start-time"
                value={form.startTime}
                onChange={(v) => set("startTime", v)}
              />
              <FieldError message={err("startTime")} />
            </div>
            <div>
              <FieldLabel
                htmlFor="mm-end-time"
                required={!!parseMDY(form.endDate)}
              >
                End Time
              </FieldLabel>
              <TimeInput
                className="bg-white"
                id="mm-end-time"
                value={form.endTime}
                onChange={(v) => set("endTime", v)}
              />
              <FieldError message={err("endTime") ?? live.endTimeError} />
            </div>
          </div>

          {/* Days — optional, Monday–Friday */}
          <div>
            <FieldLabel>Days</FieldLabel>
            {/* Same day chips as New/Edit Tutor Match */}
            <div className="flex items-center gap-2 flex-wrap mt-1">
              {MENTOR_MATCH_DAYS.map((day) => {
                const checked = form.days.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={checked}
                    aria-label={day}
                    onClick={() => toggleFormDay(day)}
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
                        : "var(--slds-g-color-text-default)",
                      cursor: "pointer",
                    }}
                  >
                    {day.slice(0, 3)}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Comment */}
          <div>
            <FieldLabel htmlFor="mm-comment">Comment</FieldLabel>
            <Textarea
              className="bg-white"
              id="mm-comment"
              value={form.comment}
              onChange={(e) => set("comment", e.target.value)}
              placeholder="Notes about this mentor match..."
              rows={4}
            />
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

const PAGE_SIZE = 12
const ALL = "all"

export function FriendsFirstMentorMatches() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState<MentorMatch[]>(getMentorMatches)
  // Reflect closures made elsewhere (e.g. a mentee marked Inactive).
  React.useEffect(
    () => subscribeMentorMatches(() => setMatches(getMentorMatches())),
    [],
  )
  const [mentee, setMentee] = useState(ALL)
  const [mentor, setMentor] = useState(ALL)
  const [subProgram, setSubProgram] = useState(ALL)
  const [days, setDays] = useState<MentorMatchDay[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<Period | "">("")
  const [isDayPopoverOpen, setIsDayPopoverOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<MentorMatch | null>(null)

  // Filter options: people that appear on at least one match.
  const menteeOptions = useMemo(
    () =>
      [...new Set(matches.map((m) => m.menteeId))]
        .map((id) => ({ id, name: menteeName(id) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [matches],
  )
  const mentorOptions = useMemo(
    () =>
      [...new Set(matches.map((m) => m.mentorId))]
        .map((id) => ({ id, name: mentorName(id) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [matches],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return matches.filter((m) => {
      const matchSearch =
        !q ||
        mentorName(m.mentorId).toLowerCase().includes(q) ||
        menteeName(m.menteeId).toLowerCase().includes(q) ||
        m.subProgram.toLowerCase().includes(q)
      return (
        matchSearch &&
        (mentee === ALL || m.menteeId === mentee) &&
        (mentor === ALL || m.mentorId === mentor) &&
        (subProgram === ALL || m.subProgram === subProgram) &&
        (days.length === 0 || days.some((d) => m.days.includes(d))) &&
        inPeriod(m, selectedPeriod)
      )
    })
  }, [matches, search, mentee, mentor, subProgram, days, selectedPeriod])

  const hasFilters =
    mentee !== ALL ||
    mentor !== ALL ||
    subProgram !== ALL ||
    days.length > 0 ||
    !!selectedPeriod ||
    !!search

  const clearFilters = () => {
    setMentee(ALL)
    setMentor(ALL)
    setSubProgram(ALL)
    setDays([])
    setSelectedPeriod("")
    setSearch("")
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageRows = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  const refresh = () => {
    setMatches(getMentorMatches())
    toast.success("Mentor matches refreshed")
  }

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }
  const openEdit = (m: MentorMatch) => {
    setEditing(m)
    setModalOpen(true)
  }

  const handleSaved = (m: MentorMatch, isNew: boolean) => {
    setModalOpen(false)
    setMatches(getMentorMatches())
    if (isNew) setPage(1)
    toast.success(isNew ? "Mentor match created" : "Mentor match updated", {
      description: `${mentorName(m.mentorId)} – ${menteeName(m.menteeId)}`,
    })
  }

  const toggleDay = (day: MentorMatchDay) =>
    setDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : MENTOR_MATCH_DAYS.filter((d) => d === day || prev.includes(d)),
    )

  // Any filter/search change returns to page 1 (Tutor Matches behavior).
  React.useEffect(() => {
    setPage(1)
  }, [search, mentee, mentor, subProgram, days, selectedPeriod])

  return (
    <div
      className="flex-1 flex flex-col min-h-0"
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
              <Heart className="h-6 w-6" />
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
                Mentor Matches
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
              onClick={refresh}
              aria-label="Refresh mentor matches"
              title="Refresh"
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
              <Plus className="h-3.5 w-3.5" /> New Mentor Match
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      {/* Extra bottom padding clears the fixed 40px UtilityBar (To Do
          List / History / Notes) so the last content is never hidden
          behind it — same approach as Tutor Matches. */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pb-16 pt-4">
        <Card
          className="w-full shadow-sm overflow-hidden !gap-0"
          style={{
            backgroundColor: "var(--slds-g-color-background-base)",
            border: "1px solid var(--slds-g-color-border-base-1)",
            borderRadius: "12px",
          }}
        >
          {/* Card header: title left, filters right (Tutor Matches pattern) */}
          <CardHeader separated className="px-6 !py-0">
            <div className="min-h-[50px] py-2.5 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span
                  className="text-base font-bold"
                  style={{
                    color: "var(--slds-g-color-text-default)",
                  }}
                >
                  Mentor Matches ({filtered.length})
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

              <div className="flex items-center gap-2 flex-wrap py-2">
                <Select value={mentee} onValueChange={setMentee}>
                  <SelectTrigger
                    aria-label="Mentee"
                    className="h-9 w-[130px] text-[13px]"
                    style={{
                      border: "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor: "var(--slds-g-color-background-base)",
                      borderRadius: "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <SelectValue placeholder="Mentee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mentees</SelectItem>
                    {menteeOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={mentor} onValueChange={setMentor}>
                  <SelectTrigger
                    aria-label="Mentor"
                    className="h-9 w-[130px] text-[13px]"
                    style={{
                      border: "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor: "var(--slds-g-color-background-base)",
                      borderRadius: "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <SelectValue placeholder="Mentor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Mentors</SelectItem>
                    {mentorOptions.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={subProgram} onValueChange={setSubProgram}>
                  <SelectTrigger
                    aria-label="Sub-Program"
                    className="h-9 w-[160px] text-[13px]"
                    style={{
                      border: "1px solid var(--slds-g-color-border-base-1)",
                      backgroundColor: "var(--slds-g-color-background-base)",
                      borderRadius: "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <SelectValue placeholder="Sub-Program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sub-Programs</SelectItem>
                    {SUB_PROGRAMMES.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Day(s) — multi-select popover */}
                <div className="relative">
                  <button
                    onClick={() => setIsDayPopoverOpen((o) => !o)}
                    className="h-[32px] px-3 text-[13px] flex items-center gap-1.5 transition-colors"
                    style={{
                      border: `1px solid ${
                        days.length > 0
                          ? "var(--color-brand-primary)"
                          : "var(--slds-g-color-border-base-1)"
                      }`,
                      backgroundColor:
                        days.length > 0
                          ? "#f0faf4"
                          : "var(--slds-g-color-background-base)",
                      color:
                        days.length > 0
                          ? "#145F33"
                          : "var(--slds-g-color-text-default)",
                      minWidth: "120px",
                      cursor: "pointer",
                      borderRadius: "var(--slds-c-input-radius-border)",
                    }}
                  >
                    <span className="flex-1 text-left truncate">
                      {days.length === 0
                        ? "Day(s)"
                        : days.length === 1
                          ? days[0].slice(0, 3)
                          : `${days.length} Days`}
                    </span>
                    <ChevronRight className="h-3 w-3 rotate-90 flex-shrink-0 opacity-50" />
                  </button>

                  {isDayPopoverOpen && (
                    <div
                      className="absolute top-full mt-1 left-0 z-50 rounded-lg shadow-lg overflow-hidden"
                      style={{
                        backgroundColor: "var(--slds-g-color-background-base)",
                        border: "1px solid var(--slds-g-color-border-base-1)",
                        minWidth: "150px",
                      }}
                    >
                      <div
                        className="px-3 py-2"
                        style={{
                          borderBottom:
                            "1px solid var(--slds-g-color-border-base-1)",
                          backgroundColor: "var(--slds-g-color-background-alt)",
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
                      {MENTOR_MATCH_DAYS.map((day) => {
                        const checked = days.includes(day)
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
                      {days.length > 0 && (
                        <button
                          onClick={() => {
                            setDays([])
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
                            (e.currentTarget.style.backgroundColor = "#fef2f2")
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
                          backgroundColor: "var(--slds-g-color-background-alt)",
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
                    className="pl-9 pr-9 h-[32px] w-40 text-[13px]"
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
                    aria-label="Search mentor matches"
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
                        active ? "#145F33" : "var(--slds-g-color-border-base-1)"
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
                      "MENTOR",
                      "MENTEE",
                      "START DATE",
                      "START TIME",
                      "END DATE",
                      "END TIME",
                      "DAY(S)",
                      "SUB-PROGRAM",
                      "EDIT",
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
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-16 text-center">
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
                          No Mentor Matches found.
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{
                            color: "var(--slds-g-color-text-weak)",
                          }}
                        >
                          Adjust your search or filters.
                        </p>
                        {hasFilters && (
                          <button
                            className="mt-2 text-xs underline"
                            style={{ color: "#145F33" }}
                            onClick={clearFilters}
                          >
                            Clear Filters
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    pageRows.map((m) => (
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
                          e.currentTarget.style.backgroundColor = "transparent"
                        }}
                      >
                        <TableCell
                          wrap
                          className="pl-6 pr-2 py-3 text-sm font-medium"
                          style={{
                            color: "var(--slds-g-color-text-default)",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/friends-first-mentor-match/${m.id}`)
                            }
                            aria-label={`View match ${mentorName(m.mentorId)} – ${menteeName(m.menteeId)}`}
                            className="text-left font-medium hover:underline focus:underline"
                            style={{
                              color: "var(--color-link-blue)",
                            }}
                          >
                            {mentorName(m.mentorId)}
                          </button>
                        </TableCell>
                        <TableCell
                          wrap
                          className="px-2 py-3 text-sm"
                          style={{
                            color: "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {menteeName(m.menteeId)}
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
                          {m.startTime}
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
                          {m.endTime}
                        </TableCell>
                        <TableCell
                          wrap
                          className="px-2 py-3"
                          style={{ maxWidth: "120px" }}
                        >
                          <span
                            className="text-xs"
                            style={{
                              color: "var(--slds-g-color-text-weak)",
                            }}
                          >
                            {m.days.map((d) => d.slice(0, 3)).join(", ") || "—"}
                          </span>
                        </TableCell>
                        <TableCell
                          wrap
                          className="px-2 py-3 text-sm"
                          style={{
                            color: "var(--slds-g-color-text-weak)",
                          }}
                        >
                          {m.subProgram}
                        </TableCell>
                        <TableCell className="text-right pr-6 py-3">
                          <button
                            title="Edit"
                            aria-label={`Edit mentor match ${mentorName(m.mentorId)} – ${menteeName(m.menteeId)}`}
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
              {totalPages > 1 ? (
                <TablePaginationBar
                  className="w-full"
                  start={pageStart + 1}
                  end={pageStart + pageRows.length}
                  total={filtered.length}
                  countLabel="records"
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPrevious={() => setPage(safePage - 1)}
                  onNext={() => setPage(safePage + 1)}
                />
              ) : (
                <PaginationInfo
                  start={filtered.length === 0 ? 0 : pageStart + 1}
                  end={pageStart + pageRows.length}
                  total={filtered.length}
                  label="records"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <MentorMatchModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  )
}
