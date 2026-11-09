import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import {
  SearchX,
  ShieldAlert,
  TriangleAlert,
} from "@/app/lib/lucide-icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import { SubstanceTestList } from "../substance-tests/SubstanceTestList";
import { BulkSubstanceTestList } from "../substance-tests/BulkSubstanceTestList";
import { getProgramById } from "../../data/mockProgramsData";

// Program Substance Tests (20065) at /program/:id/substance-tests — nested
// under the Program, so Programs stays the active top-level section and the
// Program id survives refresh, direct links and Back / Forward.
// Compatibility: the earlier /substance-tests route with Program route state
//   navigate("/substance-tests", { state: { scope: "program", programId } })
// redirects (replace) to the nested URL; without state it shows the safe
// "open from a Program" state. There is no "all Programs" view: without a
// valid Program the page shows no records. The Program NAME always comes
// from the Program store.

interface SubstanceTestRouteState {
  scope?: "program";
  programId?: number;
  programName?: string;
}

function resolveProgramId(
  state: SubstanceTestRouteState,
): number | null {
  return state.scope === "program" &&
    typeof state.programId === "number" &&
    Number.isInteger(state.programId)
    ? state.programId
    : null;
}

export function SubstanceTestListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  // Nested route: the id in the URL is the only source.
  const fromUrl =
    id !== undefined && /^\d+$/.test(id) ? Number(id) : null;
  if (id === undefined) {
    // Legacy /substance-tests: move valid Program context to the URL.
    const legacyId = resolveProgramId(
      (location.state ?? {}) as SubstanceTestRouteState,
    );
    if (legacyId !== null)
      return (
        <Navigate
          to={`/program/${legacyId}/substance-tests`}
          replace
        />
      );
  }
  const programId = fromUrl;
  const program =
    programId === null ? undefined : getProgramById(programId);

  // No (or malformed) Program context, or a Program that no longer exists.
  if (!program) {
    // Only the context-free legacy path lacks a Program; a bad or unknown
    // id in the URL is "Program Not Found".
    const missingContext = id === undefined;
    return (
      <div className="flex-1 min-h-0 overflow-y-auto pb-16 bg-[var(--slds-g-color-background-alt-2)]">
        <div className="flex flex-col items-center gap-4 px-6 py-16">
          <EmptyState
            icon={missingContext ? TriangleAlert : SearchX}
            tone={missingContext ? "warning" : "neutral"}
            title={
              missingContext
                ? "Open Substance Tests from a Program"
                : "Program Not Found"
            }
            description={
              missingContext
                ? "Substance Tests are listed per Program. Open a Program Record and select Substance Tests."
                : "The Program for these Substance Tests doesn't exist."
            }
          />
          <Button
            type="button"
            onClick={() => navigate("/program")}
          >
            Back to Programs
          </Button>
        </div>
      </div>
    );
  }

  return (
    // Single vertical scroll region; pb-16 clears the fixed UtilityBar.
    <div className="flex-1 min-h-0 overflow-y-auto pb-16 bg-[var(--slds-g-color-background-alt-2)]">
      <div className="px-6 py-4">
        <Breadcrumb className="mb-3">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="text-[15px] text-[14px]" asChild>
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
              <BreadcrumbLink className="text-[15px] text-[14px]" asChild>
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
              <BreadcrumbPage>Substance Tests</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-8 w-8 mt-0.5 flex-shrink-0 text-[var(--color-brand-primary)]" />
          <div>
            <p className="slds-text-3 uppercase tracking-widest font-semibold text-[var(--slds-g-color-text-weak)]">
              {program.name}
            </p>
            <h1 className="slds-page-header-title text-[var(--slds-g-color-text-default)]">
              Substance Tests
            </h1>
            <p className="slds-text-4 mt-0.5 text-[var(--slds-g-color-text-weak)]">
              Substance Tests created under this Program only.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-6 flex flex-col gap-4">
        <Card variant="section" elevation="sm">
          <CardHeader size="sm" separated>
            <CardTitle size="sm">Substance Tests</CardTitle>
          </CardHeader>
          {/* key: a different Program gets fresh filters and selection */}
          <SubstanceTestList
            key={program.id}
            programId={program.id}
          />
        </Card>

        <Card variant="section" elevation="sm">
          <CardHeader size="sm" separated>
            <CardTitle size="sm">
              Bulk Substance Tests
            </CardTitle>
          </CardHeader>
          <BulkSubstanceTestList
            key={program.id}
            programId={program.id}
          />
        </Card>
      </div>
    </div>
  );
}