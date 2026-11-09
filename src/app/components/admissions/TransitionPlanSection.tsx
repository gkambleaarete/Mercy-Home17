import { Pencil, Plus } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  ConnectionFormDialog,
  type Connection,
} from "./ConnectionFormDialog";
import { isoToMdy } from "../../lib/dateFormat";
import type { PlanConnection } from "../../data/transitionSummaryStore";

// Internal Transition Summary → Plan (US 20101). Reuses the existing
// Connection form in "transition-summary" mode (three types, participants
// with Constituent IDs, no Admissions automation). The form writes into
// the summary editor's draft through `onChange`; nothing is published or
// persisted until the summary itself is saved. The shared youth
// connection store is in-memory only, so Plan connections are stored in
// the summary record (one persisted copy).

export interface PlanDialogState {
  /** null = adding a new connection. */
  editing: PlanConnection | null;
}

let participantSeq = 0;

const newPlanConnectionId = () =>
  `PC-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export function TransitionPlanSection({
  connections,
  readOnly,
  dialog,
  onDialogChange,
  onChange,
}: {
  connections: PlanConnection[];
  readOnly: boolean;
  dialog: PlanDialogState | null;
  onDialogChange: (d: PlanDialogState | null) => void;
  onChange: (next: PlanConnection[]) => void;
}) {
  // Adapter for the form's list setter. Rows the form adds get a stable
  // Plan id; existing rows keep theirs.
  const setConnections: React.Dispatch<
    React.SetStateAction<Connection[]>
  > = (update) => {
    const prev = connections as unknown as Connection[];
    const next =
      typeof update === "function" ? update(prev) : update;
    const known = new Set(connections.map((c) => c.id));
    onChange(
      next.map((c) =>
        known.has(c.id)
          ? c
          : { ...c, id: newPlanConnectionId() },
      ) as unknown as PlanConnection[],
    );
  };
  // Unique per call: above every saved participant id and never repeated.
  const nextParticipantId = () =>
    Math.max(
      0,
      ...connections.flatMap((c) =>
        c.participantList.map((p) => p.id),
      ),
    ) + ++participantSeq;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h4
          id="its-plan-heading"
          className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]"
        >
          Connections
        </h4>
        {!readOnly && (
          <Button
            type="button"
            variant="outline-primary"
            size="sm"
            onClick={() => onDialogChange({ editing: null })}
          >
            <Plus />
            Add Connection
          </Button>
        )}
      </div>
      <Card variant="container">
        <Table aria-labelledby="its-plan-heading">
          <TableHeader>
            <TableRow hoverable={false}>
              {[
                "Type",
                "Start Date",
                "End Date",
                "Location",
                "Service Coordination",
                "Participants",
              ].map((h) => (
                <TableHead key={h} variant="slds">
                  {h}
                </TableHead>
              ))}
              {!readOnly && (
                <TableHead variant="slds">
                  <span className="sr-only">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {connections.length === 0 && (
              <TableRow hoverable={false}>
                <TableCell
                  tone="muted"
                  colSpan={readOnly ? 6 : 7}
                >
                  No connections added.
                </TableCell>
              </TableRow>
            )}
            {connections.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.type}</TableCell>
                <TableCell>
                  {isoToMdy(c.startDate) || "—"}
                </TableCell>
                <TableCell>
                  {isoToMdy(c.endDate) || "—"}
                </TableCell>
                <TableCell wrap>
                  {(c.location as string) || "—"}
                </TableCell>
                <TableCell>
                  {c.serviceCoordination ? "Yes" : "No"}
                </TableCell>
                <TableCell wrap>
                  {c.participantList
                    .map((p) =>
                      p.role
                        ? `${p.participant} (${p.role})`
                        : p.participant,
                    )
                    .filter(Boolean)
                    .join(", ") || "—"}
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost-primary"
                      size="icon-xs"
                      aria-label={`Modify ${c.type} connection`}
                      onClick={() =>
                        onDialogChange({ editing: c })
                      }
                    >
                      <Pencil />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {!readOnly && (
        <ConnectionFormDialog
          isOpen={!!dialog}
          onOpenChange={(o) => !o && onDialogChange(null)}
          editingConnection={
            (dialog?.editing as unknown as Connection | null) ??
            null
          }
          // Unused by the form; dialog state is owned by the summary editor.
          setEditingConnection={() => {}}
          connections={connections as unknown as Connection[]}
          setConnections={setConnections}
          getNextParticipantId={nextParticipantId}
          mode="transition-summary"
        />
      )}
    </div>
  );
}