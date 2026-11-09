import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Clock, GraduationCap } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { DateInput } from "../ui/date-input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import {
  TableToolbar,
  TablePaginationBar,
} from "../ui/table-toolbar";
import { Badge } from "../ui/badge";
import { EmptyState } from "../ui/empty-state";
import { Skeleton } from "../ui/skeleton";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  INITIAL_CLASSES,
  INITIAL_SESSIONS,
} from "../pages/Classes";

type AttendanceStatus =
  "Attended" | "Missed" | "Excused" | "Scheduled";

interface ClassSessionRecord {
  id: string;
  className: string;
  department: string;
  sessionDate: string; // MM/DD/YYYY
  sessionTime: string; // h:mm AM/PM
  sessionHours: number;
  makeupClass: boolean;
  description: string;
  attendanceStatus: AttendanceStatus;
  missedReason: string;
  // The Classes-module session this attendance record belongs to
  // (INITIAL_SESSIONS in pages/Classes.tsx). The read-only detail shows
  // that session's details.
  sessionId?: string;
}

const DEPARTMENTS = [
  "Life Skills",
  "Recreation",
  "Enrichment",
  "Career Services",
] as const;

// Sample attendance records for this constituent — prototype data only.
const INITIAL_RECORDS: ClassSessionRecord[] = [
  {
    id: "cs-1",
    className: "Brain Food",
    department: "Life Skills",
    sessionDate: "04/30/2026",
    sessionTime: "11:17 AM",
    sessionHours: 0.2,
    makeupClass: false,
    description: "h",
    attendanceStatus: "Attended",
    missedReason: "N/A",
    sessionId: "SES-001",
  },
  {
    id: "cs-2",
    className: "Body Bash",
    department: "Recreation",
    sessionDate: "05/05/2026",
    sessionTime: "12:10 PM",
    sessionHours: 0.03,
    makeupClass: false,
    description: "cvbn",
    attendanceStatus: "Attended",
    missedReason: "N/A",
    sessionId: "SES-003",
  },
  {
    id: "cs-3",
    className: "Music Class",
    department: "Enrichment",
    sessionDate: "09/08/2026",
    sessionTime: "1:19 PM",
    sessionHours: 0.68,
    makeupClass: false,
    description: "from conn fxy",
    attendanceStatus: "Attended",
    missedReason: "N/A",
    sessionId: "SES-005",
  },
  {
    id: "cs-4",
    className: "Career Event - Off Campus Visit",
    department: "Career Services",
    sessionDate: "08/06/2026",
    sessionTime: "7:15 AM",
    sessionHours: 2.0,
    makeupClass: false,
    description: "dd",
    attendanceStatus: "Attended",
    missedReason: "N/A",
    sessionId: "SES-007",
  },
];

const ATTENDANCE_BADGE_VARIANT: Record<
  AttendanceStatus,
  "success" | "error" | "warning" | "neutral"
> = {
  Attended: "success",
  Missed: "error",
  Excused: "warning",
  Scheduled: "neutral",
};

// Read-only label/value pair — same markup as the record pages' Field
// (FriendsFirstMenteeRecord, FriendsFirstMentorRecord, TutorApplicantRecord).
export function SessionField({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="slds-form-label text-[var(--slds-g-color-text-weak)] mb-1">
        {label}
      </p>
      {children ?? (
        <p className="slds-text-6 text-[var(--slds-g-color-text-default)] break-words">
          {value}
        </p>
      )}
    </div>
  );
}

export function SessionSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3
        className="text-[14px] font-semibold mb-3"
        style={{ color: "var(--slds-g-color-text-default)" }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

// Read-only list; uses the Edit Session form's own empty-state text.
export function SessionList({
  items,
  empty,
}: {
  items: string[];
  empty: string;
}) {
  if (items.length === 0)
    return (
      <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
        {empty}
      </p>
    );
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li
          key={item}
          className="slds-text-6 text-[var(--slds-g-color-text-default)] break-words"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function parseMdy(value: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!m) return null;
  const [, mm, dd, yyyy] = m;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
}

export function LeadDetailClassesTab(_props: {
  lead?: { name?: string };
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [records] =
    useState<ClassSessionRecord[]>(INITIAL_RECORDS);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Draft filter inputs — bound to the controls but not applied until "Apply".
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [draftClass, setDraftClass] = useState("all");
  const [draftDepartment, setDraftDepartment] = useState("all");

  // Applied filters — the only state that drives the visible summary/table.
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: "",
    endDate: "",
    classFilter: "all",
    department: "all",
  });

  // Session opened read-only from its Class name (null = closed).
  const [viewingSession, setViewingSession] =
    useState<ClassSessionRecord | null>(null);
  // Same two tabs as the Classes module's Session form; opens on Connection.
  const [sessionTab, setSessionTab] = useState<
    "connection" | "details"
  >("connection");
  const linkedSession = viewingSession?.sessionId
    ? (INITIAL_SESSIONS.find(
        (x) => x.id === viewingSession.sessionId,
      ) ?? null)
    : null;
  const linkedClass = linkedSession
    ? INITIAL_CLASSES.find(
        (c) => c.id === linkedSession.classId,
      )
    : undefined;

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const classOptions = useMemo(
    () =>
      Array.from(
        new Set(records.map((r) => r.className)),
      ).sort(),
    [records],
  );

  const hasAnyRecords = records.length > 0;

  const filteredRecords = useMemo(() => {
    const start = appliedFilters.startDate
      ? parseMdy(appliedFilters.startDate)
      : null;
    const end = appliedFilters.endDate
      ? parseMdy(appliedFilters.endDate)
      : null;
    return records.filter((r) => {
      const recDate = parseMdy(r.sessionDate);
      if (start && recDate && recDate < start) return false;
      if (end && recDate && recDate > end) return false;
      if (
        appliedFilters.classFilter !== "all" &&
        r.className !== appliedFilters.classFilter
      )
        return false;
      if (
        appliedFilters.department !== "all" &&
        r.department !== appliedFilters.department
      )
        return false;
      return true;
    });
  }, [records, appliedFilters]);

  const summary = useMemo(() => {
    const numberOfSessions = filteredRecords.length;
    const totalHours = filteredRecords.reduce(
      (sum, r) => sum + r.sessionHours,
      0,
    );
    return { numberOfSessions, totalHours };
  }, [filteredRecords]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / pageSize),
  );
  const pageRecords = filteredRecords.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  function handleApply() {
    setIsLoading(true);
    setAppliedFilters({
      startDate: draftStartDate,
      endDate: draftEndDate,
      classFilter: draftClass,
      department: draftDepartment,
    });
    setPage(1);
    setTimeout(() => setIsLoading(false), 350);
  }

  function handleClearFilters() {
    setIsLoading(true);
    setDraftStartDate("");
    setDraftEndDate("");
    setDraftClass("all");
    setDraftDepartment("all");
    setAppliedFilters({
      startDate: "",
      endDate: "",
      classFilter: "all",
      department: "all",
    });
    setPage(1);
    setTimeout(() => setIsLoading(false), 300);
  }

  return (
    <div className="space-y-6 w-full">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            className="text-[18px] font-semibold"
            style={{
              color: "var(--slds-g-color-text-default)",
            }}
          >
            Classes
          </h2>
          <p
            className="text-[13px] mt-0.5"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            Class participation, attendance history, and
            engagement
          </p>
        </div>
      </div>

      {/* Class Summary */}
      <div>
        <h3
          className="text-[14px] font-semibold mb-3"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          Class Summary
        </h3>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-[76px] w-full rounded-[8px]" />
            <Skeleton className="h-[76px] w-full rounded-[8px]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card variant="section" className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Number of Sessions
                    </p>
                    <p
                      className="text-2xl font-bold mt-1"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {summary.numberOfSessions}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="section" className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{
                        color: "var(--slds-g-color-text-weak)",
                      }}
                    >
                      Total Time of Sessions
                    </p>
                    <p
                      className="text-2xl font-bold mt-1"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {summary.totalHours.toFixed(2)} hours
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Class Sessions */}
      <Card variant="container">
        <TableToolbar
          title="Class Sessions"
          count={filteredRecords.length}
          countLabel="sessions"
        />

        {/* Filter controls — belong to the Class Sessions card, directly
            below its header, rather than a separate standalone section. */}
        <div
          className="px-4 py-3 border-b space-y-3"
          style={{
            borderColor: "var(--slds-g-color-border-base-1)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label
                className="slds-form-label block mb-1.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                START DATE
              </label>
              <DateInput
                value={draftStartDate}
                onChange={setDraftStartDate}
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                className="slds-form-label block mb-1.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                END DATE
              </label>
              <DateInput
                value={draftEndDate}
                onChange={setDraftEndDate}
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                className="slds-form-label block mb-1.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                CLASS
              </label>
              <Select
                value={draftClass}
                onValueChange={setDraftClass}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Classes
                  </SelectItem>
                  {classOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                className="slds-form-label block mb-1.5"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                DEPARTMENT
              </label>
              <Select
                value={draftDepartment}
                onValueChange={setDraftDepartment}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Departments
                  </SelectItem>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={isLoading}
            >
              Clear
            </Button>
            <Button
              variant="outline-primary"
              onClick={handleApply}
              disabled={isLoading}
            >
              Apply
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !hasAnyRecords ? (
          <div className="py-10">
            <EmptyState
              icon={GraduationCap}
              title="No class sessions found"
              description="There are no class sessions available for this constituent."
            />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-10">
            <EmptyState
              icon={GraduationCap}
              title="No matching class sessions"
              description="Try adjusting or clearing your filters to see more class sessions."
              actionLabel="Clear Filters"
              onAction={handleClearFilters}
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow hoverable={false}>
                  <TableHead variant="slds">Class</TableHead>
                  <TableHead variant="slds">
                    Session Date
                  </TableHead>
                  <TableHead variant="slds">
                    Session Time
                  </TableHead>
                  <TableHead variant="slds">
                    Session Hours
                  </TableHead>
                  <TableHead variant="slds">
                    Makeup Class
                  </TableHead>
                  <TableHead variant="slds">
                    Description
                  </TableHead>
                  <TableHead variant="slds">
                    Attendance Status
                  </TableHead>
                  <TableHead variant="slds">
                    Missed Reason
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {/* Opens this exact session (not just the class), so
                          classes with several sessions open the right one. */}
                      <Button
                        variant="link"
                        className="h-auto p-0 font-medium text-[var(--color-link-blue)]"
                        onClick={() => {
                          setSessionTab("connection");
                          setViewingSession(record);
                        }}
                      >
                        {record.className}
                      </Button>
                    </TableCell>
                    <TableCell>{record.sessionDate}</TableCell>
                    <TableCell>{record.sessionTime}</TableCell>
                    <TableCell>
                      {record.sessionHours.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {record.makeupClass ? "Yes" : "No"}
                    </TableCell>
                    <TableCell
                      className="max-w-[220px] truncate"
                      title={record.description}
                    >
                      {record.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ATTENDANCE_BADGE_VARIANT[
                            record.attendanceStatus
                          ]
                        }
                        bordered
                      >
                        {record.attendanceStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.missedReason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div
              className="px-4 py-3 border-t"
              style={{
                borderColor:
                  "var(--slds-g-color-border-base-1)",
              }}
            >
              <TablePaginationBar
                start={
                  filteredRecords.length === 0
                    ? 0
                    : (page - 1) * pageSize + 1
                }
                end={Math.min(
                  page * pageSize,
                  filteredRecords.length,
                )}
                total={filteredRecords.length}
                countLabel="sessions"
                currentPage={page}
                totalPages={totalPages}
                onPrevious={() =>
                  setPage((p) => Math.max(1, p - 1))
                }
                onNext={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
              />
            </div>
          </>
        )}
      </Card>

      {/* Read-only "Session" modal: the linked Classes-module session in
          the same Connection / Details tabs as its Session form, with every
          field as text. Close is the only action. */}
      <Dialog
        open={viewingSession !== null}
        onOpenChange={(open) =>
          !open && setViewingSession(null)
        }
      >
        <DialogContent size="lg">
          {viewingSession && (
            <>
              <DialogHeader>
                <DialogTitle>Session</DialogTitle>
                <DialogDescription>
                  {viewingSession.className}
                </DialogDescription>
              </DialogHeader>
              {/* px-0 pt-0: the tab bar runs edge to edge directly under
                  the header; the side padding moves onto each tab's content. */}
              <DialogBody className="px-0 pt-0">
                <Tabs
                  value={sessionTab}
                  onValueChange={(v) =>
                    setSessionTab(v as "connection" | "details")
                  }
                >
                  <TabsList
                    variant="underline"
                    separated
                    className="gap-6"
                  >
                    <TabsTrigger
                      value="connection"
                      variant="underline"
                      size="sm"
                    >
                      Connection
                    </TabsTrigger>
                    <TabsTrigger
                      value="details"
                      variant="underline"
                      size="sm"
                    >
                      Details
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="connection"
                    className="px-6"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-4">
                      <SessionField
                        label="Type"
                        value={
                          linkedClass?.name ??
                          viewingSession.className
                        }
                      />
                      <SessionField
                        label="Location"
                        value={
                          !linkedSession
                            ? "—"
                            : linkedSession.campus === "Other"
                              ? `Other – ${linkedSession.otherLocation || "—"}`
                              : linkedSession.campus || "—"
                        }
                      />
                      <div className="sm:col-span-2">
                        <SessionField
                          label="Session Description"
                          value={
                            (linkedSession
                              ? linkedSession.description
                              : viewingSession.description) ||
                            "—"
                          }
                        />
                      </div>
                      <SessionField
                        label="Start Date"
                        value={
                          (linkedSession
                            ? linkedSession.date
                            : viewingSession.sessionDate) || "—"
                        }
                      />
                      <SessionField
                        label="Start Time"
                        value={
                          (linkedSession
                            ? linkedSession.time
                            : viewingSession.sessionTime) || "—"
                        }
                      />
                      <SessionField
                        label="End Date"
                        value={linkedSession?.endDate || "—"}
                      />
                      <SessionField
                        label="End Time"
                        value={linkedSession?.endTime || "—"}
                      />
                    </div>
                    <div className="space-y-6 pt-6">
                      <SessionSection title="Programs">
                        <SessionList
                          items={(
                            linkedSession?.programs ?? []
                          ).map((pr) => pr.name)}
                          empty="No programs assigned."
                        />
                      </SessionSection>
                      <SessionSection title="Participants">
                        <SessionList
                          items={(
                            linkedSession?.participants ?? []
                          ).map((pt) =>
                            pt.role
                              ? `${pt.name} — ${pt.role}`
                              : pt.name,
                          )}
                          empty="No participants added."
                        />
                      </SessionSection>
                      <SessionSection title="Learning Modules">
                        <SessionList
                          items={(
                            linkedSession?.modules ?? []
                          ).map((m) => m.name)}
                          empty="No modules selected."
                        />
                      </SessionSection>
                    </div>
                  </TabsContent>
                  <TabsContent value="details" className="px-6">
                    <div className="space-y-6 pt-4">
                      <SessionField
                        label="Comments"
                        value={
                          (linkedSession
                            ? linkedSession.description
                            : viewingSession.description) || "—"
                        }
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogBody>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setViewingSession(null)}
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