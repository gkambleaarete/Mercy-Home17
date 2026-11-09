// Observations shown on a Youth / Community Care Member profile's
// "Observations" tab. PROTOTYPE: sample entries generated per member and
// kept for the session (in memory), so each profile shows only its own
// observations.
import type { FeedObservation } from "../components/pages/CommunityCareObservationsFeed"

const cache = new Map<string, FeedObservation[]>()

const mdy = (daysAgo: number) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`
}

const SAMPLES: [number, string, string, string, string[], string][] = [
  [0, "9:15 AM", "Sohan Jadhavrao", "Belonging", ["Peer Interaction", "Communication"], "Joined the group check-in and helped a newer member find a seat."],
  [1, "2:40 PM", "Marcus Lee", "Socio-Emotional Wellness", ["Regulation/Bounce Back"], "Was frustrated after a missed bus but calmed down and rescheduled."],
  [3, "11:00 AM", "Sohan Jadhavrao", "Self-Empowerment", ["Education/Career"], "Asked for help updating a resume for a part-time role."],
  [6, "4:05 PM", "Dana Kim", "Navigation", ["Timeliness/Attendance"], "Arrived on time for the third session in a row."],
]

export function getProfileObservations(memberId: string, memberName: string): FeedObservation[] {
  const hit = cache.get(memberId)
  if (hit) return hit
  const rows = SAMPLES.map(([days, time, author, outcomeDomain, areas, comments], i) => ({
    memberId: Number(memberId) || 0,
    date: mdy(days),
    time,
    outcomeDomain,
    areas,
    comments,
    savedAt: new Date(Date.now() - i * 1000).toISOString(),
    author,
    memberName,
  }))
  cache.set(memberId, rows)
  return rows
}
