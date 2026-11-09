// Packing Summary counts for the bulk Pack Meds checklists (PackMedsPage,
// PackMedsDialog) — 20042. One definition so Total / Packed / Remaining
// always count the same thing:
//   • Scheduled: each (youth, medication) row whose frequency isn't PRN /
//     As needed. Packed counts those rows that show as packed — the
//     checklist marks a row packed by medication name — so Remaining is
//     Total − Packed over the same rows and can never go negative.
//   • PRN: the checklist's PRN items, counted on their own. They are not
//     scheduled doses, so they never change the scheduled counts.

const NON_SCHEDULED = ["PRN", "As needed"];

export interface PackingSummary {
  scheduledTotal: number;
  scheduledPacked: number;
  scheduledRemaining: number;
  prnTotal: number;
  prnPacked: number;
}

export function packingSummary(
  youth: {
    medications: { name: string; frequency: string }[];
  }[],
  packed: ReadonlySet<string>,
  prnItems: readonly string[],
): PackingSummary {
  const scheduled = youth.flatMap((y) =>
    y.medications.filter(
      (m) => !NON_SCHEDULED.includes(m.frequency),
    ),
  );
  const scheduledPacked = scheduled.filter((m) =>
    packed.has(m.name),
  ).length;
  return {
    scheduledTotal: scheduled.length,
    scheduledPacked,
    scheduledRemaining: scheduled.length - scheduledPacked,
    prnTotal: prnItems.length,
    prnPacked: prnItems.filter((n) => packed.has(n)).length,
  };
}