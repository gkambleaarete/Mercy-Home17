// US 20221 — read-only Staff Member Status block for Shift Handover.
// Shows each staff member beside the role label recorded on their entry.
// Never editable; separate from the narrative and checklist responses.

import { fmt12h, fmtMdy, type StaffStatusSnapshot } from "../../data/shiftRoleStore";

export function StaffStatusHandoverBlock({
  snapshot,
  title = "Staff Member Status",
  hint,
}: {
  snapshot: StaffStatusSnapshot | null | undefined;
  title?: string;
  hint?: string;
}) {
  const rows = snapshot?.rows ?? [];
  return (
    <section aria-label={title} className="space-y-1" data-testid="handover-staff-status">
      <div className="text-sm font-semibold" style={{ color: "var(--slds-g-color-text-default)" }}>
        {title}
      </div>
      {hint && (
        <div className="text-xs" style={{ color: "var(--slds-g-color-text-weak)" }}>
          {hint}
        </div>
      )}
      {rows.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--slds-g-color-text-weak)" }}>
          No Staff Member Status entries recorded for this shift.
        </p>
      ) : (
        <ul
          className="rounded-md px-3 py-2 space-y-1 text-sm"
          style={{
            border: "1px dashed var(--slds-g-color-border-base-1)",
            backgroundColor: "var(--slds-g-color-background-alt)",
            color: "var(--slds-g-color-text-default)",
          }}
        >
          {rows.map((r) => (
            <li key={r.entryId}>
              <span className="font-medium">{r.staffName}</span>
              {" — "}
              <span>{r.roleLabel ?? "No shift role"}</span>
              <span>: {r.status}</span>
              {r.date && (
                <span style={{ color: "var(--slds-g-color-text-weak)" }}>
                  {" "}({fmtMdy(r.date)} {fmt12h(r.time)})
                </span>
              )}
              {r.notes && (
                <span className="block pl-3" style={{ color: "var(--slds-g-color-text-weak)" }}>
                  Notes: {r.notes}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
