import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  PROJECTION_CODES,
  type ProjectionCode,
  type ProjectionNote,
} from "../../data/mockProjectionsWaitlistData";
import {
  formatOccupancy,
  type BedProjections as BedProjectionsData,
  type CapacityTotals,
  type ProjectedYouth,
  type ProjectionMonth,
} from "../../lib/projectionsWaitlist";
import { BedProjectionProgramRow } from "./BedProjectionProgramRow";
import { ProjectionCodeBadge } from "./BedProjectionYouthRow";

interface BedProjectionsProps {
  data: BedProjectionsData;
  months: ProjectionMonth[];
  notes: Record<string, ProjectionNote>;
  canEdit: boolean;
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

function CapacityCard({
  title,
  totals,
  index,
}: {
  title: string;
  totals: CapacityTotals;
  index: number;
}) {
  const open = totals.open?.[index] ?? 0;
  const pct = formatOccupancy(
    totals.occupied?.[index] ?? 0,
    totals.capacity?.[index] ?? 0,
  );
  return (
    <Card variant="section" elevation="sm">
      <CardHeader size="sm" separated>
        <CardTitle size="sm">{title}</CardTitle>
      </CardHeader>
      <CardContent size="sm" className="grid grid-cols-2 gap-4">
        <div>
          <p className="slds-text-2 uppercase tracking-wide text-[var(--slds-g-color-text-weak)]">
            Open Beds
          </p>
          <p className="slds-text-7 font-bold">{open}</p>
        </div>
        <div>
          <p className="slds-text-2 uppercase tracking-wide text-[var(--slds-g-color-text-weak)]">
            Projected Occupancy
          </p>
          <p className="slds-text-7 font-bold">{pct}</p>
          <p className="slds-text-2 text-[var(--slds-g-color-text-weak)]">
            {totals.occupied?.[index] ?? 0} of {totals.capacity?.[index] ?? 0}{" "}
            beds
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

const LEGEND: {
  variant:
    | "neutral"
    | "info"
    | "success"
    | "error"
    | "purple"
    | "orange";
  label: string;
  meaning: string;
}[] = [
  {
    variant: "neutral",
    label: "Resident",
    meaning: "Active resident occupying a bed",
  },
  {
    variant: "info",
    label: "Prospective",
    meaning: "Info Session scheduled or projected move-in",
  },
  {
    variant: "success",
    label: "Confirmed",
    meaning: "Program Waitlist confirmed / internal transfer",
  },
  {
    variant: "error",
    label: "Departing",
    meaning: "Planned discharge, departure, bed pause or delay",
  },
  {
    variant: "purple",
    label: "Note",
    meaning: "Transition notes and future plans",
  },
  {
    variant: "orange",
    label: "Readmit",
    meaning: "Returning youth (also marked on the Waitlist)",
  },
];

export function BedProjections({
  data,
  months,
  notes,
  canEdit,
  onCodeChange,
  onNoteSave,
  onOpenYouth,
  onMoveRank,
  onSetRank,
}: BedProjectionsProps) {
  const [totalsMonth, setTotalsMonth] = useState(months[0]?.key ?? "");
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(["noha", "seton"]),
  );
  const monthIndex = Math.max(
    0,
    months.findIndex((m) => m.key === totalsMonth),
  );

  const toggle = (homeId: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(homeId)) next.delete(homeId);
      else next.add(homeId);
      return next;
    });

  return (
    <Card variant="section" elevation="sm">
      <CardHeader
        size="sm"
        separated
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <CardTitle className="slds-text-5 font-semibold">
            Bed Projections
          </CardTitle>
          <CardDescription className="slds-text-3">
            Built from current Program Enrollments plus waitlist
            youth with an Anticipated Program and Move-In Date.
            Expand a home to update an individual youth's
            projection or notes, rank anticipated youth, or
            select a name to open quick edit.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="totals-month" className="slds-text-3">
            Totals for
          </Label>
          <Select
            value={totalsMonth}
            onValueChange={setTotalsMonth}
          >
            <SelectTrigger
              id="totals-month"
              size="sm"
              className="w-[130px]"
            >
              <SelectValue placeholder="Please Select" />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.key} value={m.key}>
                  {m.longLabel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent size="sm" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.campuses.map((c) => (
            <CapacityCard
              key={c.campus}
              title={`${c.campus} Campus`}
              totals={c}
              index={monthIndex}
            />
          ))}
          <CapacityCard
            title="Agency Total"
            totals={data.agency}
            index={monthIndex}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 slds-text-3">
          {PROJECTION_CODES.map((c) => (
            <span
              key={c.code}
              className="flex items-center gap-1.5"
            >
              <ProjectionCodeBadge code={c.code} />
              {c.label}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 slds-text-3">
          {LEGEND.map((l) => (
            <span
              key={l.label}
              className="flex items-center gap-1.5"
            >
              <Badge variant={l.variant}>{l.label}</Badge>
              {l.meaning}
            </span>
          ))}
        </div>
      </CardContent>

      <Table>
        <TableHeader>
          <TableRow hoverable={false}>
            <TableHead
              variant="slds"
              className="sticky left-0 z-20 min-w-[340px]"
            >
              Home / Youth
            </TableHead>
            <TableHead variant="slds">DOB</TableHead>
            {months.map((m) => (
              <TableHead
                key={m.key}
                variant="slds"
                active={m.key === totalsMonth}
                className="text-center min-w-[96px]"
              >
                {m.label}
              </TableHead>
            ))}
            <TableHead variant="slds" className="text-center">
              Notes
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.campuses.map((campus) => (
            <CampusRows
              key={campus.campus}
              campus={campus}
              months={months}
              expanded={expanded}
              onToggle={toggle}
              notes={notes}
              canEdit={canEdit}
              onCodeChange={onCodeChange}
              onNoteSave={onNoteSave}
              onOpenYouth={onOpenYouth}
              onMoveRank={onMoveRank}
              onSetRank={onSetRank}
            />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function CampusRows({
  campus,
  months,
  expanded,
  onToggle,
  notes,
  canEdit,
  onCodeChange,
  onNoteSave,
  onOpenYouth,
  onMoveRank,
  onSetRank,
}: {
  campus: BedProjectionsData["campuses"][number];
  months: ProjectionMonth[];
  expanded: Set<string>;
  onToggle: (homeId: string) => void;
  notes: Record<string, ProjectionNote>;
  canEdit: boolean;
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
}) {
  return (
    <>
      <TableRow
        hoverable={false}
        className="bg-[var(--slds-g-color-background-alt)]"
      >
        <TableCell className="sticky left-0 z-10 bg-[var(--slds-g-color-background-alt)] pl-4 slds-text-3 font-semibold uppercase tracking-wide">
          {campus.campus} Campus
        </TableCell>
        <TableCell className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
          {campus.homes.length} homes
        </TableCell>
        {/* Campus summary — open beds · projected occupancy per month. */}
        {months.map((m, i) => (
          <TableCell
            key={m.key}
            className="text-center slds-text-3 font-semibold"
          >
            {campus.open?.[i] ?? 0} open ·{" "}
            {formatOccupancy(
              campus.occupied?.[i] ?? 0,
              campus.capacity?.[i] ?? 0,
            )}
          </TableCell>
        ))}
        <TableCell />
      </TableRow>
      {campus.homes.map((h) => (
        <BedProjectionProgramRow
          key={h.home.id}
          projection={h}
          months={months}
          expanded={expanded.has(h.home.id)}
          onToggle={onToggle}
          notes={notes}
          canEdit={canEdit}
          onCodeChange={onCodeChange}
          onNoteSave={onNoteSave}
          onOpenYouth={onOpenYouth}
          onMoveRank={onMoveRank}
          onSetRank={onSetRank}
        />
      ))}
    </>
  );
}