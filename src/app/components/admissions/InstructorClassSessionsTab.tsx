// Instructor profile → Education and Vocation → Class Sessions (US 20096).
//
// Lists only the sessions whose instructors are linked to this Instructor's
// Constituent ID (explicit INSTRUCTOR_CONSTITUENT_LINKS map — never by
// name). Reads the same shared session records as the Classes page, so an
// edit there shows here. Read-only: list, search by ID / Class Name, and
// open one session's details. No Rating columns.

import { useMemo, useState } from "react";
import { CalendarX, Search } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { EmptyState } from "../ui/empty-state";
import { TablePaginationBar } from "../ui/table-toolbar";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  useSharedClassSessions,
  useSharedClasses,
  type ClassSession,
} from "../pages/Classes";
import {
  formatAttendance,
  searchInstructorSessions,
  sessionsForInstructorConstituent,
  summarizeAttendance,
} from "../../data/instructorClassSessions";
import {
  SessionField,
  SessionList,
  SessionSection,
} from "./LeadDetailClassesTab";

const PAGE_SIZE = 12;

function attendanceLabel(a: boolean | null) {
  return a === true
    ? "Attended"
    : a === false
      ? "Not Attended"
      : "Unmarked";
}

export function InstructorClassSessionsTab({
  instructor,
}: {
  /** The Instructor constituent; `id` is the stable Constituent ID. */
  instructor: { id: number; name: string };
}) {
  const [sessions] = useSharedClassSessions();
  const [classes] = useSharedClasses();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  const className = (s: ClassSession) =>
    classes.find((c) => c.id === s.classId)?.name ?? s.classId;

  const scoped = useMemo(
    () =>
      sessionsForInstructorConstituent(
        sessions,
        instructor.id,
      ).map((s) => ({
        session: s,
        id: s.id,
        className: className(s),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessions, classes, instructor.id],
  );
  const rows = searchInstructorSessions(scoped, search);
  const totalPages = Math.max(
    1,
    Math.ceil(rows.length / PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // Details always resolve by session ID from the current shared records.
  const open = openId
    ? (scoped.find((r) => r.id === openId) ?? null)
    : null;
  const openSummary = open
    ? summarizeAttendance(open.session.participants)
    : null;

  return (
    <div
      className="overflow-hidden"
      style={{
        border: "1px solid var(--slds-g-color-border-base-1)",
        borderRadius: "var(--slds-c-card-radius-border)",
        backgroundColor: "var(--slds-g-color-background-base)",
      }}
    >
      <div
        className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
        style={{
          borderBottom:
            "1px solid var(--slds-g-color-border-base-1)",
          backgroundColor: "var(--slds-g-color-background-alt)",
        }}
      >
        <h2
          className="text-[15px] font-semibold"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          Class Sessions
        </h2>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10"
            style={{ color: "var(--slds-g-color-text-weak)" }}
            aria-hidden
          />
          <Input
            type="search"
            aria-label="Search sessions by ID or Class Name"
            surface="base"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search ID or Class Name"
            className="h-9 w-72 max-w-full text-[13px] pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              {[
                "ID",
                "Class Name",
                "Session Date",
                "Session Time",
                "Attendance",
              ].map((col) => (
                <TableHead key={col} variant="slds">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow hoverable={false}>
                <TableCell colSpan={5}>
                  {scoped.length === 0 ? (
                    <EmptyState
                      icon={CalendarX}
                      title="No class sessions"
                      description={`${instructor.name} is not an instructor on any class session.`}
                    />
                  ) : (
                    <EmptyState
                      icon={Search}
                      title="No sessions match your search"
                      description="Try a different ID or Class Name, or clear the search."
                    />
                  )}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="px-4">
                    <button
                      type="button"
                      onClick={() => setOpenId(r.id)}
                      className="font-medium text-[#0176d3] hover:underline rounded focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      aria-label={`Open session ${r.id} details`}
                    >
                      {r.id}
                    </button>
                  </TableCell>
                  <TableCell wrap className="px-4">
                    {r.className}
                  </TableCell>
                  <TableCell className="px-4">
                    {r.session.date || "—"}
                  </TableCell>
                  <TableCell className="px-4">
                    {r.session.time || "—"}
                  </TableCell>
                  <TableCell className="px-4">
                    {formatAttendance(
                      summarizeAttendance(
                        r.session.participants,
                      ),
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {rows.length > 0 && (
        <TablePaginationBar
          className="w-full"
          start={(safePage - 1) * PAGE_SIZE + 1}
          end={Math.min(safePage * PAGE_SIZE, rows.length)}
          total={rows.length}
          countLabel="Sessions"
          currentPage={safePage}
          totalPages={totalPages}
          onPrevious={() => setPage(safePage - 1)}
          onNext={() => setPage(safePage + 1)}
        />
      )}

      {/* Session details — DLG-01, read-only */}
      <Dialog
        open={open !== null}
        onOpenChange={(o) => !o && setOpenId(null)}
      >
        <DialogContent size="xl">
          {open && openSummary && (
            <>
              <DialogHeader>
                <DialogTitle>Session {open.id}</DialogTitle>
                <DialogDescription>
                  {open.className}
                </DialogDescription>
              </DialogHeader>
              <DialogBody className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <SessionField
                    label="Session ID"
                    value={open.id}
                  />
                  <SessionField
                    label="Class"
                    value={open.className}
                  />
                  <SessionField
                    label="Start Date"
                    value={open.session.date || "—"}
                  />
                  <SessionField
                    label="Start Time"
                    value={open.session.time || "—"}
                  />
                  <SessionField
                    label="End Date"
                    value={open.session.endDate || "—"}
                  />
                  <SessionField
                    label="End Time"
                    value={open.session.endTime || "—"}
                  />
                  <SessionField
                    label="Location"
                    value={
                      open.session.campus === "Other"
                        ? `Other – ${open.session.otherLocation || "—"}`
                        : open.session.campus || "—"
                    }
                  />
                  <SessionField
                    label="Status"
                    value={open.session.status || "—"}
                  />
                  <div className="sm:col-span-2">
                    <SessionField
                      label="Session Description"
                      value={open.session.description || "—"}
                    />
                  </div>
                </div>
                <SessionSection title="Instructors">
                  <SessionList
                    items={open.session.instructors.map((i) =>
                      i.title
                        ? `${i.name}, ${i.title}`
                        : i.name,
                    )}
                    empty="No instructors assigned."
                  />
                </SessionSection>
                <SessionSection title="Participants & Attendance">
                  <p
                    className="slds-text-4 mb-2"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    {formatAttendance(openSummary)}
                  </p>
                  <SessionList
                    items={open.session.participants.map(
                      (p) =>
                        `${p.name}${p.role ? ` — ${p.role}` : ""}: ${attendanceLabel(p.attended)}`,
                    )}
                    empty="No participants added."
                  />
                </SessionSection>
                <SessionSection title="Learning Modules">
                  <SessionList
                    items={open.session.modules.map(
                      (m) => m.name,
                    )}
                    empty="No modules selected."
                  />
                </SessionSection>
                <SessionSection title="Programs">
                  <SessionList
                    items={open.session.programs.map(
                      (p) => p.name,
                    )}
                    empty="No programs assigned."
                  />
                </SessionSection>
              </DialogBody>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpenId(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}