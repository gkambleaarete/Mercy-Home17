import { useLocation, useNavigate } from "react-router";
import { CalendarDays } from "@/app/lib/lucide-icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import {
  PassCalendar,
  type PassCalendarScope,
} from "../passes/PassCalendar";
import { getProgramById } from "../../data/mockProgramsData";

// Pass Calendar page (20041) at /pass/calendar. Same navigation-state
// convention as PassListPage: { scope: "program", programId } or all.
// Only all/program are accepted — the Calendar is never offered for a
// single youth (Constituent Profile), so any other state falls back to all.

interface PassCalendarRouteState {
  scope?: string;
  programId?: number;
}

function resolveScope(
  state: PassCalendarRouteState,
): PassCalendarScope {
  if (
    state.scope === "program" &&
    typeof state.programId === "number"
  )
    return { scope: "program", programId: state.programId };
  return { scope: "all" };
}

export function PassCalendarPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const scope = resolveScope(
    (location.state ?? {}) as PassCalendarRouteState,
  );
  const program =
    scope.scope === "program"
      ? getProgramById(scope.programId)
      : undefined;

  return (
    // Single vertical scroll region; pb-16 clears the fixed UtilityBar.
    <div className="flex-1 min-h-0 overflow-y-auto pb-16 bg-[var(--slds-g-color-background-alt-2)]">
      <div className="px-6 py-4">
        {program && (
          <Breadcrumb className="mb-3">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button
                    type="button"
                    onClick={() => navigate("/program")}
                  >
                    Programs
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/program/${program.id}`)
                    }
                  >
                    {program.name}
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Pass Calendar</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <div className="flex items-start gap-3">
          <CalendarDays className="h-8 w-8 mt-0.5 flex-shrink-0 text-[var(--color-brand-primary)]" />
          <div>
            <p className="slds-text-3 uppercase tracking-widest font-semibold text-[var(--slds-g-color-text-weak)]">
              Pass
            </p>
            <h1 className="slds-page-header-title text-[var(--slds-g-color-text-default)]">
              {program
                ? `${program.name} Pass Calendar`
                : "Pass Calendar"}
            </h1>
            <p className="slds-text-4 mt-0.5 text-[var(--slds-g-color-text-weak)]">
              {program
                ? "Passes for this Program only."
                : "All Passes for all youth and Programs."}
            </p>
          </div>
        </div>
      </div>
      <div className="mx-6">
        <PassCalendar
          key={`${scope.scope}:${"programId" in scope ? scope.programId : ""}`}
          {...scope}
        />
      </div>
    </div>
  );
}