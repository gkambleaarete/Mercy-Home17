import { useEffect, useState } from "react";
import { todayIso } from "../data/mockProgramsData";

/**
 * Today's local calendar date ("YYYY-MM-DD") as React state, so anything
 * resolved "as of today" — effective Capacity Snapshot (19989), derived
 * Program Status (17673) — re-renders when the date rolls over while the
 * page is open, with no record open/save needed.
 *
 * No polling: one timeout is armed for the next local midnight and re-armed
 * after it fires. Because timers can fire late (or not at all) while a
 * laptop sleeps, the date is also re-checked when the tab becomes visible
 * again. State only changes when the calendar date actually differs.
 */
export function useTodayIso(): string {
  const [today, setToday] = useState(todayIso);

  useEffect(() => {
    const sync = () => setToday(todayIso());

    const now = new Date();
    const nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );
    const timer = window.setTimeout(
      sync,
      nextMidnight.getTime() - now.getTime() + 1000,
    );

    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener(
        "visibilitychange",
        onVisible,
      );
    };
    // Re-arm for the following midnight each time the date changes.
  }, [today]);

  return today;
}