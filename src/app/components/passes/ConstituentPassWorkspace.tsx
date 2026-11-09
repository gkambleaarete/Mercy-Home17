import { useEffect, useRef, useState } from "react";
import { PassList } from "./PassList";
import { PassCalendar } from "./PassCalendar";
import { usePassDialog } from "../../contexts/PassDialogContext";
import { getConstituentById } from "../../data/mockYouthProgramData";
import {
  isPassTabConstituent,
  useConstituentPassContext,
} from "../../lib/constituentPassContext";

// Constituent detail → General → Pass. Shows the shared Pass list for one
// Constituent and its current Program; New / View / Edit / Copy open the
// shared Pass modal over this page with Youth and Program fixed to this
// Constituent's context (see lib/constituentPassContext).
//
// The role is re-checked against the saved record here too, so a crafted
// section value or stale state never renders the workspace for an
// ineligible record.
//
// List and Calendar are two views of the same scope inside this section
// (no route change). Each stays mounted once first shown — hidden, so it is
// out of the tab order — which keeps the list's filters/sort/page/selection
// and the calendar's date/mode/filters when switching back and forth.

export function ConstituentPassWorkspace({
  constituentId,
}: {
  constituentId: number;
}) {
  const { registerOwnerScope } = usePassDialog();
  const ctx = useConstituentPassContext(constituentId);
  const eligible = isPassTabConstituent(
    getConstituentById(constituentId),
  );

  const [view, setView] = useState<"list" | "calendar">("list");
  const [calendarSeen, setCalendarSeen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const switched = useRef(false);
  function showView(next: "list" | "calendar") {
    switched.current = true;
    if (next === "calendar") setCalendarSeen(true);
    setView(next);
  }
  // After a switch, focus lands on the new view's own switch button (where
  // the user's pointer/keyboard just was), never on a hidden control.
  useEffect(() => {
    if (!switched.current) return;
    (view === "list" ? listRef : calendarRef).current
      ?.querySelector<HTMLElement>("[data-view-switch]")
      ?.focus();
  }, [view]);

  // Tells the modal host this profile is on screen: contextual launches
  // (including a later toast "View Pass") are honored only while it is, and
  // leaving the profile closes its modal.
  useEffect(
    () => registerOwnerScope(constituentId),
    [constituentId, registerOwnerScope],
  );

  if (!eligible) return null;

  return (
    // Calendar View / List View are hidden (display:none → also out of the
    // tab order) inside Constituent profiles only; the buttons, handlers and
    // view switching stay in place. Remove the `hidden` rule to bring them
    // back. The main Pass and Program screens are not affected.
    <section
      aria-label="Pass"
      className="space-y-3 [&_[data-view-switch]]:hidden"
    >
      <div>
        <h2 className="slds-text-heading-small font-semibold text-[var(--slds-g-color-text-default)]">
          Pass
        </h2>
        {ctx && ctx.status === "ok" && (
          <p className="slds-text-4 mt-0.5 text-[var(--slds-g-color-text-weak)]">
            {ctx.youthName} · {ctx.programName}. Passes for this
            Constituent in their current Program.
          </p>
        )}
      </div>
      <div ref={listRef} hidden={view !== "list"}>
        <PassList
          scope="constituent"
          constituentId={constituentId}
          onCalendarView={() => showView("calendar")}
        />
      </div>
      {calendarSeen && (
        <div ref={calendarRef} hidden={view !== "calendar"}>
          <PassCalendar
            scope="constituent"
            constituentId={constituentId}
            onListView={() => showView("list")}
          />
        </div>
      )}
    </section>
  );
}
