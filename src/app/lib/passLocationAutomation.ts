import { useEffect } from "react";
import {
  getPasses,
  subscribePasses,
} from "../data/mockPassData";
import { setYouthLocation } from "../data/youthLocationStore";
import { timeToMinutes } from "./passes";

// Pass Current Location automation (20043). ONE application-level owner,
// mounted once in the app shell, so it runs whatever page is open.
//
// Rule: a Pass whose status is not Cancelled, once local time reaches
// Start Date + Departure Time, sets ITS youth's Current Location to "Pass"
// (source = that Pass's id) — exactly once per Pass record. Recurring
// occurrences are separate records, so each fires independently.
//
// Nothing is scheduled from a stored start time: every evaluation reads the
// canonical Pass store, so edits and cancellations made before the start
// are always respected. There is intentionally NO end/return automation.

/** Passes whose start automation has already run (or was already in the
 *  past when first seen) — never re-applied, so a later manual change
 *  always wins. Kept here, not on PassRecord, so Pass Status/history are
 *  untouched. */
const handled = new Set<number>();

/** Local Date for an ISO date + "h:mm AM/PM" — no UTC parsing. */
export function localDateTime(
  iso: string,
  time: string,
): Date | null {
  const [y, m, d] = iso.split("-").map(Number);
  const mins = timeToMinutes(time);
  if (!y || !m || !d || mins === null) return null;
  return new Date(
    y,
    m - 1,
    d,
    Math.floor(mins / 60),
    mins % 60,
  );
}

export function evaluatePassStarts(
  now: Date = new Date(),
): void {
  for (const p of getPasses()) {
    if (handled.has(p.id) || p.status === "Cancelled") continue;
    const start = localDateTime(p.startDate, p.departureTime);
    if (!start || now < start) continue;
    handled.add(p.id);
    // A Pass already over when first seen (seed history, back-entered
    // records) is recorded as handled without touching Current Location.
    const end = localDateTime(p.endDate, p.returnTime);
    if (end && now >= end) continue;
    setYouthLocation(p.youthId, "Pass", {
      source: "pass",
      passId: p.id,
    });
  }
}

/** Every 30s, on any Pass change, and when the tab becomes visible. */
const INTERVAL_MS = 30_000;

export function PassLocationAutomation(): null {
  useEffect(() => {
    const run = () => evaluatePassStarts();
    run();
    const timer = window.setInterval(run, INTERVAL_MS);
    const unsubscribe = subscribePasses(run);
    const onVisible = () => {
      if (document.visibilityState === "visible") run();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      unsubscribe();
      document.removeEventListener(
        "visibilitychange",
        onVisible,
      );
    };
  }, []);
  return null;
}