/**
 * ConstituentLeadDetailPage
 *
 * Wraps LeadDetailView so that clicking a constituent in the Constituents
 * module opens the exact same detail experience as the Admissions youth
 * profile.  The constituent's data is mapped to the `lead` shape that
 * LeadDetailView expects.
 */

import { useEffect, useState } from "react";
import {
  useParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";
import { LeadDetailView } from "../admissions/LeadDetailView";
import { CONSTITUENTS } from "../../data/mockConstituents";
import { OrganizationConstituentDetailPage } from "./OrganizationConstituentDetailPage";
// Brings constituents created from Mentor Applications into CONSTITUENTS
// as soon as this page loads (side-effect import).
import "../../data/ffMentorApplicationStore";
import { localTodayIso } from "../../lib/dateFormat";
import { useUnsavedChangesGuard } from "../../lib/useUnsavedChangesGuard";
import { isPassTabConstituent } from "../../lib/constituentPassContext";

/**
 * True while a dialog on this page holds values the user has entered but not
 * yet saved or cancelled (an edit happened inside an open dialog and no
 * dialog has closed since). Drives the shared unsaved-changes confirmation
 * so switching youth or leaving the profile never silently discards a draft.
 * Page-level fields outside dialogs are tracked by usePageFieldDraft.
 */
function useOpenDialogDraft(): boolean {
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    const inDialog = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest('[role="dialog"]');
    const onEdit = (e: Event) => {
      if (inDialog(e.target)) setDirty(true);
    };
    const onPick = (e: Event) => {
      const t = e.target;
      if (
        inDialog(t) &&
        t instanceof Element &&
        t.closest('[role="option"], [role="checkbox"], [role="switch"], [role="radio"]')
      )
        setDirty(true);
    };
    // Dialogs mount in portals directly under <body>; when none is left
    // open, the draft was saved or cancelled.
    const observer = new MutationObserver(() => {
      if (!document.querySelector('[role="dialog"]')) setDirty(false);
    });
    observer.observe(document.body, { childList: true });
    document.addEventListener("input", onEdit, true);
    document.addEventListener("change", onEdit, true);
    document.addEventListener("click", onPick, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("input", onEdit, true);
      document.removeEventListener("change", onEdit, true);
      document.removeEventListener("click", onPick, true);
    };
  }, []);
  return dirty;
}

type FieldEl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLElement;

const fieldValue = (el: FieldEl) =>
  el.isContentEditable
    ? el.innerHTML
    : (el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;

/** Editable page-level fields that can hold a draft. Search/filter boxes,
 *  read-only/disabled fields, and checkbox/radio/file controls (row
 *  selection, not data entry) are not drafts. */
function isDraftField(t: EventTarget | null): t is FieldEl {
  if (!(t instanceof HTMLElement)) return false;
  if (t.closest('[role="dialog"], [role="alertdialog"], [data-leave-guard-ignore]')) return false;
  const tag = t.tagName;
  const isEditable =
    tag === "TEXTAREA" || tag === "SELECT" || tag === "INPUT" || t.isContentEditable;
  if (!isEditable) return false;
  const el = t as HTMLInputElement;
  if (el.readOnly || el.disabled) return false;
  if (tag === "INPUT" && ["checkbox", "radio", "file", "search", "button", "submit", "hidden", "range"].includes(el.type)) return false;
  const label = `${el.placeholder ?? ""} ${el.getAttribute("aria-label") ?? ""} ${el.id ?? ""} ${el.getAttribute("role") ?? ""}`;
  if (/search|filter|combobox/i.test(label)) return false;
  return true;
}

/**
 * True while an editable page-level field (outside any dialog) differs from
 * the value it had when the user first focused it, and the field is still on
 * screen. Clicking a Save/Update/Apply/Done-style button re-baselines the
 * fields (the edit was committed); Cancel/Reset/Discard clears them. Heuristic
 * for the prototype: sections do not report their own dirty state.
 */
function usePageFieldDraft(): boolean {
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    const baselines = new Map<FieldEl, string>();
    const recompute = () => {
      let any = false;
      for (const [el, base] of baselines) {
        if (!el.isConnected) {
          baselines.delete(el);
          continue;
        }
        if (fieldValue(el) !== base) any = true;
      }
      setDirty(any);
    };
    const onFocus = (e: Event) => {
      if (isDraftField(e.target) && !baselines.has(e.target))
        baselines.set(e.target, fieldValue(e.target));
    };
    const onEdit = (e: Event) => {
      if (!isDraftField(e.target)) return;
      if (!baselines.has(e.target)) baselines.set(e.target, fieldValue(e.target));
      recompute();
    };
    const onClick = (e: Event) => {
      const btn = (e.target as Element | null)?.closest?.("button, [role='button']");
      if (!btn) return;
      const text = `${btn.textContent ?? ""} ${btn.getAttribute("aria-label") ?? ""}`.trim();
      if (/^(cancel|reset|discard|undo)/i.test(text)) {
        baselines.clear();
      } else if (/^(save|update|apply|done|confirm|submit|finalize|complete)/i.test(text)) {
        // Commit: whatever is on screen now is the new baseline.
        window.setTimeout(() => {
          for (const el of baselines.keys()) baselines.set(el, fieldValue(el));
          recompute();
        }, 0);
      }
      window.setTimeout(recompute, 50);
    };
    let raf = 0;
    const main = document.querySelector("main") ?? document.body;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recompute);
    });
    observer.observe(main, { childList: true, subtree: true });
    document.addEventListener("focusin", onFocus, true);
    document.addEventListener("input", onEdit, true);
    document.addEventListener("change", onEdit, true);
    document.addEventListener("click", onClick, true);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("focusin", onFocus, true);
      document.removeEventListener("input", onEdit, true);
      document.removeEventListener("change", onEdit, true);
      document.removeEventListener("click", onClick, true);
    };
  }, []);
  return dirty;
}

/** Shared unsaved-changes confirmation for the profile. Discard needs no
 *  cleanup: the held navigation unmounts the profile. */
function ProfileLeaveGuard() {
  const hasOpenDraft = useOpenDialogDraft();
  const hasFieldDraft = usePageFieldDraft();
  return (
    <>
      {useUnsavedChangesGuard(
        hasOpenDraft || hasFieldDraft,
        () => {},
        "this profile",
      )}
    </>
  );
}

/** Map a constituent record to the minimal `lead` shape LeadDetailView uses. */
export function constituentToLead(
  constituent: (typeof CONSTITUENTS)[number],
) {
  return {
    id: String(constituent.id),
    name: constituent.name,
    program: constituent.program,
    guardian: "Not Specified",
    stage:
      constituent.status === "Active"
        ? "Active Enrollment"
        : constituent.status,
    daysInStage: 0,
    status: constituent.status,
    lastActivity: constituent.lastUpdated,
    alerts: [] as string[],
    phone: constituent.phone ?? "",
    email: constituent.email ?? "",
    completedStages: [] as string[],
    // Optional demographic fields surfaced from the constituent record
    constituentType: constituent.type,
    role: constituent.role,
    gender: "",
    ageGroup: "Youth",
    campus: "",
    createdDate: constituent.lastUpdated,
  };
}

/** Fallback lead used when no constituent matches the URL id. */
function fallbackLead(id: string) {
  return {
    id,
    name: "Unknown Constituent",
    program: "",
    guardian: "",
    stage: "Active Enrollment",
    daysInStage: 0,
    status: "Active",
    lastActivity: localTodayIso(),
    alerts: [] as string[],
    phone: "",
    email: "",
    completedStages: [] as string[],
    createdDate: localTodayIso(),
  };
}

export function ConstituentLeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state ?? {}) as {
    backTo?: string;
    backLabel?: string;
  };
  const backTo = navState.backTo;
  const backLabelFromState = navState.backLabel;
  const [searchParams] = useSearchParams();
  // Rendered as its own component so a draft starting does not re-render the
  // profile itself (which would reset in-progress dialog state).
  const leaveGuard = <ProfileLeaveGuard />;

  const constituent = CONSTITUENTS.find(
    (c) => String(c.id) === id,
  );

  const INDIVIDUAL_ROLES_WITH_ORG_TABS = new Set([
    "Case Manager",
    // Community Care Member renders in LeadDetailView (its own sidebar).
    "Community Care Manager of Care Coordination",
    "Community Care Staff",
    "Contractor",
    "External Constituent",
    "Friends First Mentee",
    "Friends First Mentor",
    "Instructor",
    "Masters Level Administrative Staff",
    "MHBG Staff",
    "Nurse",
    "Residential Program Authorization Agent",
    "Tutor",
  ]);

  // Organization constituents — and the 12 specified Individual roles — get the
  // tailored detail page with Contact / Constituent Roles / Relationships / Connections tabs
  if (
    constituent?.type === "Organization" ||
    (constituent?.type === "Individual" &&
      INDIVIDUAL_ROLES_WITH_ORG_TABS.has(constituent.role))
  ) {
    return (
      <>
        <OrganizationConstituentDetailPage
          // Remount per record so the active tab, selected rows and open
          // dialogs never carry over to another constituent.
          key={constituent.id}
          constituent={constituent}
          onBack={() => navigate("/constituents")}
          // ?section=pass is honored only for an eligible saved role.
          initialSection={
            searchParams.get("section") === "pass" &&
            isPassTabConstituent(constituent)
              ? "pass"
              : undefined
          }
        />
        {leaveGuard}
      </>
    );
  }

  const lead = constituent
    ? constituentToLead(constituent)
    : fallbackLead(id ?? "0");

  return (
    <>
    <LeadDetailView
      // Remount per record so open dialogs, drafts and section state never
      // carry over to another constituent.
      key={constituent?.id ?? id}
      lead={lead}
      // Opened from Community Care: breadcrumb/back return there.
      onBack={() => navigate(backTo ?? "/constituents")}
      backLabel={backLabelFromState ?? "Constituents"}
      profileExtras
      initialOverviewSection={
        searchParams.get("section") === "documents"
          ? "documents"
          : searchParams.get("section") === "pass" &&
              isPassTabConstituent(constituent)
            ? "pass"
            : "constituent-details"
      }
      // Pass section: Individual Youth / Community Care Member records only.
      constituentPassId={
        isPassTabConstituent(constituent)
          ? constituent.id
          : undefined
      }
      hideConvertButton={true}
      hidePipelineProgress={true}
      hideStatusSelect={true}
      hideOtcDashboard={true}
      hideTreatmentPlanningTabs={["supplementalPlans"]}
      useConstituentIncidentDialog={true}
      showTransitionSummary={true}
      initialTransitionSummaryId={
        searchParams.get("section") === "transition-summary"
          ? (searchParams.get("summary") ?? undefined)
          : undefined
      }
      useGeneralAccordion={true}
    />
    {leaveGuard}
    </>
  );
}