import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router";
import { CalendarRange } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  PROGRAM_ENROLLMENTS,
  WAITLIST_CONNECTIONS,
  getHomeName,
  getAnticipatedRanks,
  getProjectionNotes,
  getProjectionOverrides,
  getResidentPlans,
  getWaitlist,
  setAnticipatedRanksData,
  setProjectionNotesData,
  setProjectionOverridesData,
  setResidentPlansData,
  setWaitlistData,
  type FieldHistoryEntry,
  type ProjectionCode,
  type ProjectionNote,
  type ResidentPlan,
  type WaitlistCandidate,
} from "../../data/mockProjectionsWaitlistData";
import {
  CURRENT_USER_NAME,
  getCapacitySnapshots,
} from "../../data/mockProgramsData";
import {
  describeClosureSaveFailure,
  finalizeCaseClosure,
  getClosureStatus,
  markClosureNotificationsRead,
  processClosureEligibility,
  reopenCaseClosure,
  startCaseClosure,
  useCaseClosures,
} from "../../data/caseClosureStore";
import { useTodayIso } from "../../lib/useTodayIso";
import {
  getCandidateFullProfile,
  getResidentFullProfile,
} from "../../lib/youthIdentity";
import { ClosingList } from "../admissions/ClosingList";
import { ClosureDataNotice } from "../admissions/ClosureDataNotice";
import {
  EMPTY_RESIDENT_PLAN,
  PROJECTIONS_ROLES,
  applyResidentPlanEdit,
  applyWaitlistEdit,
  buildBedProjections,
  filterWaitlist,
  getActiveWaitlist,
  getProjectionMonths,
  getEnrolledLeadIds,
  getProjectionsPermissions,
  indexConnectionDates,
  normalizeRanks,
  overrideKey,
  referralRangeError,
  sortWaitlist,
  type ProjectedYouth,
  type ProjectionsRole,
} from "../../lib/projectionsWaitlist";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";
import { BedProjections } from "../admissions/BedProjections";
import { WaitlistQueue } from "../admissions/WaitlistQueue";
import {
  ResidentQuickEditDialog,
  WaitlistCandidateDialog,
} from "../admissions/WaitlistCandidateDialog";
import {
  DEFAULT_WAITLIST_FILTERS,
  type WaitlistFilterState,
} from "../admissions/WaitlistFilters";

const formatHistoryValue = (
  field: FieldHistoryEntry["field"],
  value: string,
) =>
  field === "Anticipated Program"
    ? getHomeName(value)
    : field === "Anticipated Move-In Date"
      ? isoToMdy(value)
      : value;

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
/** Complete MM/DD/YYYY filter text → ISO; partial text is not applied. */
const filterDate = (mdy: string) => {
  const iso = mdyToIso(mdy);
  return ISO_RE.test(iso) ? iso : "";
};

// Staffing: Youth Projections & Waitlist (US 17573).
// Bed Projections is derived — enrollments + anticipated placements — and
// only individual youth codes/notes are editable. The Waitlist below is an
// individual work queue whose Anticipated Program + Move-In feed the grid.
export function ProjectionsWaitlistDashboard() {
  const navigate = useNavigate();
  // Follows the calendar date (midnight rollover + tab resume) so Days in
  // Category, the month window and Closing List eligibility stay current.
  const today_iso = useTodayIso();
  const today = useMemo(() => {
    const [y, m, d] = today_iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [today_iso]);
  const months = useMemo(
    () => getProjectionMonths(today),
    [today],
  );

  // Shared closure lifecycle (same store the Admissions Pipeline reads).
  const { closures, notifications } = useCaseClosures();
  const closedCaseIds = useMemo(
    () => new Set(Object.keys(closures)),
    [closures],
  );
  // Idempotent in-app eligibility processing: on load, day rollover and
  // resume. A real deployment needs a scheduled backend job instead.
  useEffect(() => {
    processClosureEligibility(new Date());
    const onVisible = () => {
      if (document.visibilityState === "visible")
        processClosureEligibility(new Date());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () =>
      document.removeEventListener(
        "visibilitychange",
        onVisible,
      );
  }, [today_iso]);

  const [candidates, setCandidates] = useState<
    WaitlistCandidate[]
  >(() => getWaitlist());
  const [overrides, setOverrides] = useState<
    Record<string, ProjectionCode>
  >(() => getProjectionOverrides());
  const [notes, setNotes] = useState<
    Record<string, ProjectionNote>
  >(() => getProjectionNotes());
  const [role, setRole] = useState<ProjectionsRole>(
    "Admissions Team",
  );
  const [filters, setFilters] = useState<WaitlistFilterState>(
    DEFAULT_WAITLIST_FILTERS,
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const [residentPlans, setResidentPlans] = useState<
    Record<string, ResidentPlan>
  >(() => getResidentPlans());
  const [ranks, setRanks] = useState<Record<string, number>>(
    () => getAnticipatedRanks(),
  );
  const [openResidentId, setOpenResidentId] = useState<
    string | null
  >(null);

  const {
    canEditProjections,
    canEditWaitlist,
    canEditOccupancyCodes,
  } = getProjectionsPermissions(role);

  const projections = useMemo(
    () =>
      buildBedProjections({
        months,
        enrollments: PROGRAM_ENROLLMENTS,
        candidates,
        residentPlans,
        ranks,
        overrides,
        capacitySnapshots: getCapacitySnapshots(),
        todayIso: today_iso,
        closedCaseIds,
      }),
    [
      months,
      candidates,
      residentPlans,
      ranks,
      overrides,
      today_iso,
      closedCaseIds,
    ],
  );

  const connections = useMemo(
    () => indexConnectionDates(WAITLIST_CONNECTIONS),
    [],
  );
  const activeWaitlist = useMemo(
    () =>
      getActiveWaitlist(
        candidates,
        PROGRAM_ENROLLMENTS,
        closedCaseIds,
      ),
    [candidates, closedCaseIds],
  );
  const enrolledCount = useMemo(() => {
    const enrolled = getEnrolledLeadIds(PROGRAM_ENROLLMENTS);
    return candidates.filter((c) => enrolled.has(c.id)).length;
  }, [candidates]);
  // Closing List: in closure, not yet finalized (finalized cases live in
  // the Admissions Closed category).
  const closingCases = useMemo(
    () =>
      Object.values(closures).filter(
        (c) => c.state === "closing",
      ),
    [closures],
  );
  const caseManagers = useMemo(
    () =>
      [
        ...new Set(
          activeWaitlist
            .map((c) => c.caseManager)
            .filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [activeWaitlist],
  );

  const referralFromIso = filterDate(filters.referralFrom);
  const referralToIso = filterDate(filters.referralTo);
  const rangeError = referralRangeError(
    referralFromIso,
    referralToIso,
  );
  const waitlistRows = useMemo(
    () =>
      sortWaitlist(
        filterWaitlist(activeWaitlist, {
          ...filters,
          referralFrom: referralFromIso,
          referralTo: referralToIso,
        }),
        filters.order,
      ),
    [activeWaitlist, filters, referralFromIso, referralToIso],
  );

  const handleCodeChange = useCallback(
    (
      youthKey: string,
      monthKey: string,
      code: ProjectionCode,
    ) => {
      // Mutation guard mirrors the UI: Admissions Team only (AC55).
      // Prototype role switching is UI simulation, not Salesforce security.
      if (!canEditOccupancyCodes) return;
      setOverrides((prev) => {
        const next = {
          ...prev,
          [overrideKey(youthKey, monthKey)]: code,
        };
        setProjectionOverridesData(next);
        return next;
      });
    },
    [canEditOccupancyCodes],
  );

  const handleNoteSave = useCallback(
    (youthKey: string, text: string) => {
      if (!canEditProjections) return;
      setNotes((prev) => {
        const next = { ...prev };
        if (text)
          next[youthKey] = {
            text,
            updatedBy: CURRENT_USER_NAME,
            updatedAt: new Date().toISOString(),
          };
        else delete next[youthKey];
        setProjectionNotesData(next);
        return next;
      });
      toast.success(
        text
          ? "Projection note saved"
          : "Projection note removed",
      );
    },
    [canEditProjections],
  );

  const handleOpen = useCallback(
    (id: string) => setOpenId(id),
    [],
  );

  const openCandidate = openId
    ? (candidates.find((c) => c.id === openId) ?? null)
    : null;

  // ── Anticipated youth ranking (per Program) ──────────────────────────
  const updateRanks = (
    fn: (
      prev: Record<string, number>,
    ) => Record<string, number>,
  ) =>
    setRanks((prev) => {
      const next = fn(prev);
      setAnticipatedRanksData(next);
      return next;
    });

  /** A youth's rank belongs to its Anticipated Program, so it is dropped
   *  when the Program changes or the move is cancelled. */
  const dropRank = (youthKey: string) =>
    updateRanks((prev) => {
      if (!(youthKey in prev)) return prev;
      const { [youthKey]: _removed, ...rest } = prev;
      return rest;
    });

  const handleMoveRank = useCallback(
    (homeId: string, youthKey: string, direction: -1 | 1) => {
      const home = projections.campuses
        .flatMap((c) => c.homes)
        .find((h) => h.home.id === homeId);
      if (!home) return;
      const order = home.youth
        .filter((y) => y.kind === "anticipated")
        .map((y) => y.key);
      const from = order.indexOf(youthKey);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= order.length) return;
      [order[from], order[to]] = [order[to], order[from]];
      // Persist the whole Program order so it stays exactly as shown.
      updateRanks((prev) => ({
        ...prev,
        ...Object.fromEntries(order.map((k, i) => [k, i + 1])),
      }));
    },
    [projections],
  );

  const handleSetRank = useCallback(
    (homeId: string, youthKey: string, rank: number) => {
      const home = projections.campuses
        .flatMap((c) => c.homes)
        .find((h) => h.home.id === homeId);
      if (!home) return;
      const order = home.youth
        .filter((y) => y.kind === "anticipated")
        .map((y) => y.key);
      updateRanks((prev) => ({
        ...prev,
        ...normalizeRanks(order, youthKey, rank),
      }));
    },
    [projections],
  );

  const handleOpenYouth = useCallback(
    (source: ProjectedYouth["source"]) => {
      if (source.kind === "candidate") setOpenId(source.id);
      else setOpenResidentId(source.id);
    },
    [],
  );

  // ── Waitlist candidate quick edit ────────────────────────────────────
  const saveCandidate = (
    prev: WaitlistCandidate,
    edited: WaitlistCandidate,
    comment?: string,
  ): WaitlistCandidate | null => {
    const saved = applyWaitlistEdit(
      prev,
      edited,
      CURRENT_USER_NAME,
      new Date(),
      formatHistoryValue,
      comment,
    );
    // Closure lifecycle: entering Closed starts the Closing List timer
    // once (re-saves never reset it); leaving Closed before finalization
    // reopens the case. It runs FIRST: if the closure can't be saved,
    // nothing else changes, the dialog stays open with its entries, and no
    // success is reported (the store writes once, or not at all).
    let closureSaved = true;
    if (
      saved.category === "Closed" &&
      prev.category !== "Closed"
    )
      closureSaved = startCaseClosure(
        saved.id,
        saved.name,
        new Date(),
      );
    else if (
      saved.category !== "Closed" &&
      prev.category === "Closed"
    )
      closureSaved = reopenCaseClosure(saved.id);
    if (!closureSaved) {
      toast.error(`${saved.name} was not saved`, {
        description: describeClosureSaveFailure(),
      });
      return null;
    }
    if (prev.anticipatedProgram !== saved.anticipatedProgram)
      dropRank(`cand:${saved.id}`);
    const next = candidates.map((c) =>
      c.id === saved.id ? saved : c,
    );
    setCandidates(next);
    setWaitlistData(next);
    setOpenId(null);
    return saved;
  };

  const handleWaitlistSave = (
    edited: WaitlistCandidate,
    comment?: string,
  ) => {
    const prev = candidates.find((c) => c.id === edited.id);
    if (!prev) return;
    const saved = saveCandidate(prev, edited, comment);
    if (!saved) return;
    toast.success(`${saved.name} updated`);
  };

  const handleCandidateCancelMove = (
    comment: string,
  ): boolean => {
    const prev = candidates.find((c) => c.id === openId);
    if (!prev) return false;
    const saved = saveCandidate(
      prev,
      {
        ...prev,
        anticipatedProgram: undefined,
        anticipatedMoveInDate: undefined,
      },
      comment,
    );
    if (!saved) return false;
    toast.success(
      `Anticipated move cancelled for ${prev.name}`,
    );
    return true;
  };

  // ── Current resident quick edit ──────────────────────────────────────
  const openEnrollment = openResidentId
    ? PROGRAM_ENROLLMENTS.find((e) => e.id === openResidentId)
    : undefined;
  const openResident = openEnrollment
    ? {
        enrollmentId: openEnrollment.id,
        fullProfile: getResidentFullProfile(openEnrollment),
        name: openEnrollment.youthName,
        dateOfBirth: openEnrollment.dateOfBirth,
        homeId: openEnrollment.homeId,
        actualMoveInDate: openEnrollment.actualMoveInDate,
        plan:
          residentPlans[openEnrollment.id] ??
          EMPTY_RESIDENT_PLAN,
      }
    : null;

  const saveResidentPlan = (
    enrollmentId: string,
    edited: ResidentPlan,
    comment?: string,
  ) => {
    const prev =
      residentPlans[enrollmentId] ?? EMPTY_RESIDENT_PLAN;
    const saved = applyResidentPlanEdit(
      enrollmentId,
      prev,
      edited,
      CURRENT_USER_NAME,
      new Date(),
      formatHistoryValue,
      comment,
    );
    if (prev.anticipatedProgram !== saved.anticipatedProgram)
      dropRank(`xfer:${enrollmentId}`);
    setResidentPlans((p) => {
      const next = { ...p, [enrollmentId]: saved };
      setResidentPlansData(next);
      return next;
    });
    setOpenResidentId(null);
  };

  const handleResidentSave = (
    edited: ResidentPlan,
    comment?: string,
  ) => {
    if (!openResident) return;
    saveResidentPlan(
      openResident.enrollmentId,
      edited,
      comment,
    );
    toast.success(`${openResident.name} updated`);
  };

  const handleResidentCancelMove = (comment: string) => {
    if (!openResident) return;
    saveResidentPlan(
      openResident.enrollmentId,
      {
        ...openResident.plan,
        anticipatedProgram: undefined,
        anticipatedMoveInDate: undefined,
      },
      comment,
    );
    toast.success(
      `Anticipated move cancelled for ${openResident.name}`,
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--slds-g-color-background-alt-2)]">
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <CalendarRange className="h-8 w-8 mt-0.5 shrink-0 text-[var(--color-brand-primary)]" />
          <div>
            <p className="slds-text-3 uppercase tracking-widest font-semibold text-[var(--slds-g-color-text-weak)]">
              Admissions
            </p>
            <h1 className="slds-page-header-title text-[var(--slds-g-color-text-default)]">
              Projections &amp; Waitlist
            </h1>
            <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
              View six-month residential capacity projections
              and manage prospective youth awaiting placement.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="projections-role"
            className="slds-text-3"
          >
            Viewing as
          </Label>
          <Select
            value={role}
            onValueChange={(v) => setRole(v as ProjectionsRole)}
          >
            <SelectTrigger
              id="projections-role"
              size="sm"
              className="w-[200px]"
            >
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>
            <SelectContent>
              {PROJECTIONS_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!canEditWaitlist ? (
            <Badge variant="neutral" bordered>
              Read only
            </Badge>
          ) : (
            !canEditOccupancyCodes && (
              <Badge variant="neutral" bordered>
                Occupancy codes read only
              </Badge>
            )
          )}
        </div>
      </div>

      <div className="px-6 pb-6 space-y-6">
        <ClosureDataNotice scope="page" />
        <BedProjections
          data={projections}
          months={months}
          notes={notes}
          canEdit={canEditProjections}
          canEditCodes={canEditOccupancyCodes}
          onCodeChange={handleCodeChange}
          onNoteSave={handleNoteSave}
          onOpenYouth={handleOpenYouth}
          onMoveRank={handleMoveRank}
          onSetRank={handleSetRank}
        />

        <WaitlistQueue
          rows={waitlistRows}
          totalActive={activeWaitlist.length}
          enrolledCount={enrolledCount}
          closingCount={closingCases.length}
          referralRangeError={rangeError}
          caseManagers={caseManagers}
          connections={connections}
          filters={filters}
          onFiltersChange={setFilters}
          today={today}
          canEdit={canEditWaitlist}
          onOpen={handleOpen}
        />

        <ClosingList
          closures={closingCases}
          notifications={notifications}
          now={today}
          canFinalize={canEditWaitlist}
          onFinalize={(caseId) => {
            if (!canEditWaitlist) return false;
            // Success is reported only after the closure was saved.
            if (
              !finalizeCaseClosure(
                caseId,
                CURRENT_USER_NAME,
                new Date(),
              )
            ) {
              toast.error("Closure was not completed", {
                description: describeClosureSaveFailure(),
              });
              return false;
            }
            toast.success(
              "Closure completed — moved to Admissions Closed",
            );
            return true;
          }}
          onOpen={(caseId) => {
            if (candidates.some((c) => c.id === caseId))
              setOpenId(caseId);
            else {
              const link = getCandidateFullProfile(caseId);
              if (link) navigate(link.path);
            }
          }}
          onMarkRead={() => {
            if (!markClosureNotificationsRead())
              toast.error(
                "Notifications were not marked read",
                {
                  description: describeClosureSaveFailure(),
                },
              );
          }}
        />
      </div>

      <WaitlistCandidateDialog
        candidate={openCandidate}
        fullProfile={
          openCandidate
            ? getCandidateFullProfile(openCandidate.id)
            : null
        }
        closureLabel={
          openCandidate && closures[openCandidate.id]
            ? {
                closing: "Closing List",
                eligible: "Eligible for Archive",
                finalized: "Closed",
              }[
                getClosureStatus(
                  closures[openCandidate.id],
                  today,
                )
              ]
            : undefined
        }
        connections={
          openCandidate
            ? (connections[openCandidate.id] ?? {})
            : {}
        }
        today={today}
        canEdit={canEditWaitlist}
        onClose={() => setOpenId(null)}
        onSave={handleWaitlistSave}
        onCancelMove={handleCandidateCancelMove}
      />

      <ResidentQuickEditDialog
        resident={openResident}
        today={today}
        canEdit={canEditProjections}
        onClose={() => setOpenResidentId(null)}
        onSave={handleResidentSave}
        onCancelMove={handleResidentCancelMove}
      />
    </div>
  );
}