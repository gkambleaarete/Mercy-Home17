import { memo } from "react";
import { ChevronDown, ChevronRight } from "@/app/lib/lucide-icons";
import { TableCell, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import type {
  ProjectionCode,
  ProjectionNote,
} from "../../data/mockProjectionsWaitlistData";
import type {
  CapacityTotals,
  HomeProjection,
  ProjectedYouth,
  ProjectionMonth,
} from "../../lib/projectionsWaitlist";
import { BedProjectionYouthRow } from "./BedProjectionYouthRow";

/** One month's availability: Open, then Reserved · Anticipated, and an
 *  explicit overcommitment note instead of a negative Open count. */
export function AvailabilityCell({
  totals,
  index,
  monthLabel,
}: {
  totals: CapacityTotals;
  index: number;
  monthLabel: string;
}) {
  const open = totals.open[index];
  const reserved = totals.reserved[index];
  const anticipated = totals.anticipated[index];
  const over = totals.overcommitted[index];
  return (
    <div
      className="flex flex-col items-center leading-tight"
      title={`${monthLabel}: ${open} open · ${reserved} reserved · ${anticipated} anticipated of ${totals.capacity[index]} beds${over ? ` · over by ${over}` : ""}`}
    >
      <span className="slds-text-3 font-semibold">
        {open} open
      </span>
      <span className="slds-text-2 font-normal text-[var(--slds-g-color-text-weak)]">
        {reserved} res · {anticipated} ant
      </span>
      {over > 0 && (
        <span className="slds-text-2 font-semibold text-destructive">
          Over by {over}
        </span>
      )}
    </div>
  );
}

interface BedProjectionProgramRowProps {
  projection: HomeProjection;
  months: ProjectionMonth[];
  expanded: boolean;
  onToggle: (homeId: string) => void;
  notes: Record<string, ProjectionNote>;
  canEdit: boolean;
  canEditCodes: boolean;
  onCodeChange: (
    youthKey: string,
    monthKey: string,
    code: ProjectionCode,
  ) => void;
  onNoteSave: (youthKey: string, text: string) => void;
  onOpenYouth: (source: ProjectedYouth["source"]) => void;
  onMoveRank: (
    homeId: string,
    youthKey: string,
    direction: -1 | 1,
  ) => void;
  onSetRank: (
    homeId: string,
    youthKey: string,
    rank: number,
  ) => void;
}

export const BedProjectionProgramRow = memo(
  function BedProjectionProgramRow({
    projection,
    months,
    expanded,
    onToggle,
    notes,
    canEdit,
    canEditCodes,
    onCodeChange,
    onNoteSave,
    onOpenYouth,
    onMoveRank,
    onSetRank,
  }: BedProjectionProgramRowProps) {
    const { home, youth, bedCount } = projection;
    const residents = youth.filter(
      (y) => y.kind === "resident",
    );
    const anticipated = youth.filter(
      (y) => y.kind === "anticipated",
    );
    const rowProps = {
      months,
      canEdit,
      canEditCodes,
      onCodeChange,
      onNoteSave,
      onOpen: onOpenYouth,
    };

    return (
      <>
        <TableRow>
          <TableCell className="sticky left-0 z-10 bg-card pl-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(home.id)}
              aria-expanded={expanded}
            >
              {expanded ? <ChevronDown /> : <ChevronRight />}
              {home.name}
            </Button>
            <span className="slds-text-3 text-[var(--slds-g-color-text-weak)] ml-1">
              {residents.length} residents
              {anticipated.length > 0 &&
                ` · ${anticipated.length} anticipated`}
            </span>
          </TableCell>
          <TableCell className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
            Capacity {bedCount}
          </TableCell>
          {/* Per month: Open = capacity − residents holding a bed (S / ?)
              − Reserved − Anticipated, shown in the Home row itself. */}
          {months.map((m, i) => (
            <TableCell key={m.key} className="text-center">
              <AvailabilityCell
                totals={projection}
                index={i}
                monthLabel={m.longLabel}
              />
            </TableCell>
          ))}
          <TableCell />
        </TableRow>

        {/* Expanded: the Home's youth directly underneath — residents by
            actual move-in date, then incoming youth in rank order. */}
        {expanded && (
          <>
            {residents.map((y, i) => (
              <BedProjectionYouthRow
                key={y.key}
                youth={y}
                note={notes[y.key]}
                bedNumber={i + 1}
                overCapacity={i >= bedCount}
                {...rowProps}
              />
            ))}
            {/* Anticipated youth are a ranked list for the Program — not
                tied to any specific bed or departing resident. */}
            {anticipated.map((y) => (
              <BedProjectionYouthRow
                key={y.key}
                youth={y}
                note={notes[y.key]}
                onMove={
                  canEdit
                    ? (key, dir) =>
                        onMoveRank(home.id, key, dir)
                    : undefined
                }
                onSetRank={
                  canEdit
                    ? (key, rank) =>
                        onSetRank(home.id, key, rank)
                    : undefined
                }
                isFirst={y.rank === 1}
                isLast={y.rank === anticipated.length}
                {...rowProps}
              />
            ))}
          </>
        )}
      </>
    );
  },
);