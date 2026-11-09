import { useEffect } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import {
  PassListPage,
  type PassListRouteState,
} from "./PassListPage";
import { usePassDialog } from "../../contexts/PassDialogContext";
import type { PassCreateDefaults } from "../passes/PassRecordDialog";

// Compatibility adapter for the legacy Pass record URLs — /pass/new,
// /pass/:id and /pass/:id/edit. Pass records no longer have a standalone
// page: New, Edit and View open in the shared Pass modal
// (PassDialogProvider). Bookmarked or refreshed links still work: this
// route renders a real Pass list behind the modal and opens the matching
// mode. Closing the modal goes to that list at /pass (it never relies on
// browser history), so no in-app Pass action uses these URLs.
//
// Create defaults and a valid list scope may still arrive through
// location.state; with none, the all-Pass list is shown.

type LegacyState = PassCreateDefaults & PassListRouteState;

export function PassRecordPage() {
  const { id } = useParams<{ id: string }>();
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  const { openCreate, openEdit, openView } = usePassDialog();

  const legacy = (state ?? {}) as LegacyState;
  // Scope of the list behind the modal: the supplied one, else the Program
  // a Program-scoped create came from, else all Passes.
  const listState: PassListRouteState =
    legacy.scope === "program" ||
    legacy.scope === "youth" ||
    legacy.scope === "all"
      ? {
          scope: legacy.scope,
          programId: legacy.programId,
          youthId: legacy.youthId,
        }
      : id === undefined &&
          typeof legacy.defaultProgramId === "number"
        ? {
            scope: "program",
            programId: legacy.defaultProgramId,
          }
        : { scope: "all" };

  useEffect(() => {
    const launch = {
      onClose: () =>
        navigate("/pass", { replace: true, state: listState }),
    };
    if (id === undefined) {
      openCreate({
        defaultYouthId: legacy.defaultYouthId,
        defaultProgramId: legacy.defaultProgramId,
        defaultStartDate: legacy.defaultStartDate,
        copyFromId: legacy.copyFromId,
        ...launch,
      });
    } else if (pathname.endsWith("/edit")) {
      openEdit(Number(id), launch);
    } else {
      openView(Number(id), launch);
    }
    // Opens once per record URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return <PassListPage routeState={listState} />;
}
