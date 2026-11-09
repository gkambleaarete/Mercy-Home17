import { useLocation, useNavigate } from "react-router";
import { Ticket } from "@/app/lib/lucide-icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import {
  PassList,
  type PassListScope,
} from "../passes/PassList";
import { getProgramById } from "../../data/mockProgramsData";
import { getYouthName } from "../../data/mockYouthProgramData";

// Pass object List View (19992) at /pass. Resolves the scope from navigation
// state — the app's existing pattern for carrying context (cf. Program Log's
// { programId, programName }) — and renders the shared PassList:
//   navigate("/pass")                                            → all
//   navigate("/pass", { state: { scope: "program", programId } }) → program
//   navigate("/pass", { state: { scope: "youth", youthId } })     → youth

export interface PassListRouteState {
  scope?: "all" | "program" | "youth";
  programId?: number;
  youthId?: string;
}

function resolveScope(
  state: PassListRouteState,
): PassListScope {
  if (
    state.scope === "program" &&
    typeof state.programId === "number"
  )
    return { scope: "program", programId: state.programId };
  if (state.scope === "youth" && state.youthId)
    return { scope: "youth", youthId: state.youthId };
  return { scope: "all" };
}

export function PassListPage({
  routeState,
}: {
  /** Scope to use instead of the navigation state (the legacy /pass/…
   *  compatibility routes render the list behind their modal this way). */
  routeState?: PassListRouteState;
} = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const scope = resolveScope(
    routeState ?? ((location.state ?? {}) as PassListRouteState),
  );

  const program =
    scope.scope === "program"
      ? getProgramById(scope.programId)
      : undefined;
  const youthName =
    scope.scope === "youth" ? getYouthName(scope.youthId) : "";

  const title =
    scope.scope === "program"
      ? `${program?.name ?? "Program"} Passes`
      : scope.scope === "youth"
        ? `${youthName || "Youth"} Passes`
        : "Passes";
  const subtitle =
    scope.scope === "program"
      ? "Passes for this Program only."
      : scope.scope === "youth"
        ? "Every Pass for this youth, across all Programs."
        : "All Passes for all youth and Programs.";

  return (
    // Single vertical scroll region; pb-16 clears the fixed UtilityBar.
    <div className="flex-1 min-h-0 overflow-y-auto pb-16 bg-[var(--slds-g-color-background-alt-2)]">
      <div className="px-6 py-4">
        {scope.scope === "program" && program && (
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
                <BreadcrumbPage>Passes</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <div className="flex items-start gap-3">
          <Ticket className="h-8 w-8 mt-0.5 flex-shrink-0 text-[var(--color-brand-primary)]" />
          <div>
            <p className="slds-text-3 uppercase tracking-widest font-semibold text-[var(--slds-g-color-text-weak)]">
              Pass
            </p>
            <h1 className="slds-page-header-title text-[var(--slds-g-color-text-default)]">
              {title}
            </h1>
            <p className="slds-text-4 mt-0.5 text-[var(--slds-g-color-text-weak)]">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
      <div className="mx-6">
        {/* key: a different scope gets fresh filter state */}
        <PassList
          key={`${scope.scope}:${"programId" in scope ? scope.programId : ""}:${"youthId" in scope ? scope.youthId : ""}`}
          {...scope}
        />
      </div>
    </div>
  );
}