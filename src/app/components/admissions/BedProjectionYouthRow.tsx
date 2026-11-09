import { memo, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  MessageSquarePlus,
  MessageSquareText,
} from "@/app/lib/lucide-icons";
import { TableCell, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
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
import { getHomeName } from "../../data/mockProjectionsWaitlistData";
import type {
  ProjectedYouth,
  ProjectionMonth,
} from "../../lib/projectionsWaitlist";
import { formatMdy } from "../../lib/dateFormat";
import { YouthTypeBadge } from "./WaitlistQueue";

// S = standard, LV = red (Agency Discharge), X = open bed (plain outline so
// it never reads as "incoming youth"), ? = unsure. T (Internal Transition):
// its color is PENDING a business decision — a temporary bordered neutral
// badge, told apart from S by the letter and its label.
const CODE_BADGE: Record<
  ProjectionCode,
  {
    variant: "neutral" | "error" | "outline" | "warning";
    bordered?: boolean;
  }
> = {
  S: { variant: "neutral" },
  LV: { variant: "error" },
  T: { variant: "neutral", bordered: true },
  X: { variant: "outline" },
  "?": { variant: "warning" },
};

export function ProjectionCodeBadge({
  code,
}: {
  code: ProjectionCode;
}) {
  const label = PROJECTION_CODES.find(
    (c) => c.code === code,
  )?.label;
  return (
    <Badge
      variant={CODE_BADGE[code].variant}
      bordered={CODE_BADGE[code].bordered}
      title={label}
      aria-label={label}
    >
      {code}
    </Badge>
  );
}

/** Legend meaning of the youth row (see the Bed Projections legend). */
export function YouthStatusBadge({
  youth,
}: {
  youth: ProjectedYouth;
}) {
  if (youth.kind === "resident") {
    return (
      <>
        {youth.transitioning && (
          <Badge variant="purple">Transitioning</Badge>
        )}
        {youth.transitionToHomeId && (
          <Badge variant="purple" bordered>
            Planned transition →{" "}
            {getHomeName(youth.transitionToHomeId)}
          </Badge>
        )}
        {youth.plannedDischarge && (
          <Badge variant="error">Agency Discharge</Badge>
        )}
        {youth.plannedTransition && (
          <Badge variant="neutral" bordered>
            Internal Transition
          </Badge>
        )}
      </>
    );
  }
  if (youth.commitmentKind === "reserved")
    return (
      <Badge variant="success">
        Internal transition · Reserved
      </Badge>
    );
  if (youth.isInternalTransfer)
    return <Badge variant="success">Internal transition</Badge>;
  switch (youth.candidateCategory) {
    case "Program Waitlist":
      return (
        <Badge variant="success">Waitlist · confirmed</Badge>
      );
    case "Delayed":
      return <Badge variant="error">Delayed</Badge>;
    case "Info Session Scheduled":
      return <Badge variant="info">Info Session</Badge>;
    default:
      return <Badge variant="info">Projected move-in</Badge>;
  }
}

interface NoteControlProps {
  youthName: string;
  note?: ProjectionNote;
  canEdit: boolean;
  onSave: (text: string) => void;
}

function NoteControl({
  youthName,
  note,
  canEdit,
  onSave,
}: NoteControlProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  if (!note && !canEdit) return null;

  const Icon = note ? MessageSquareText : MessageSquarePlus;
  const label = note
    ? `View or edit note for ${youthName}`
    : `Add note for ${youthName}`;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(note?.text ?? "");
        setOpen(next);
      }}
    >
      {/* The span gives TooltipTrigger a real DOM ref — PopoverTrigger is a
          plain function wrapper and can't receive one. Focus bubbles to it,
          so the tooltip still shows for keyboard users. */}
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <PopoverTrigger asChild>
              <Button
                variant={note ? "ghost-primary" : "ghost"}
                size="icon-xs"
                aria-label={label}
              >
                <Icon />
              </Button>
            </PopoverTrigger>
          </span>
        </TooltipTrigger>
        <TooltipContent tone="dark" side="left">
          {note ? note.text : "Add note"}
        </TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor={`note-${youthName}`}>
            Projection note · {youthName}
          </Label>
          {canEdit ? (
            <Textarea
              id={`note-${youthName}`}
              size="sm"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Future transition plans, bed timing…"
              autoFocus
            />
          ) : (
            <p className="slds-text-3">{note?.text}</p>
          )}
          {note && (
            <p className="slds-text-2 text-[var(--slds-g-color-text-weak)]">
              Last updated by {note.updatedBy} on{" "}
              {formatMdy(note.updatedAt)}
            </p>
          )}
        </div>
        {canEdit && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="xs"
              onClick={() => {
                onSave(draft.trim());
                setOpen(false);
              }}
            >
              Save
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface BedProjectionYouthRowProps {
  youth: ProjectedYouth;
  months: ProjectionMonth[];
  note?: ProjectionNote;
  /** Notes (and, via the parent, ranking). */
  canEdit: boolean;
  /** Monthly occupancy codes — Admissions Team only. */
  canEditCodes: boolean;
  onCodeChange: (
    youthKey: string,
    monthKey: string,
    code: ProjectionCode,
  ) => void;
  onNoteSave: (youthKey: string, text: string) => void;
  /** Opens the shared quick-edit modal for this youth. */
  onOpen: (source: ProjectedYouth["source"]) => void;
  /** Anticipated youth only: move up (-1) / down (+1) within the
   *  Program. Omitted when the user can't reorder. */
  onMove?: (youthKey: string, direction: -1 | 1) => void;
  /** Anticipated youth only: set the rank directly (others renumber). */
  onSetRank?: (youthKey: string, rank: number) => void;
  isFirst?: boolean;
  isLast?: boolean;
  /** Resident only: the physical bed this youth occupies. Beyond capacity
   *  the row is labelled "Over". */
  bedNumber?: number;
  overCapacity?: boolean;
}

/** Bed # / rank slot — fixed width so names line up across rows. */
function BedLabel({ children }: { children: ReactNode }) {
  return (
    <span className="slds-text-3 font-semibold w-14 shrink-0 text-[var(--slds-g-color-text-weak)]">
      {children}
    </span>
  );
}

/** Editable rank: commit on Enter or blur; invalid input reverts. */
function RankInput({
  youth,
  onSetRank,
}: {
  youth: ProjectedYouth;
  onSetRank: (youthKey: string, rank: number) => void;
}) {
  const [draft, setDraft] = useState(String(youth.rank ?? ""));
  const [lastRank, setLastRank] = useState(youth.rank);
  if (lastRank !== youth.rank) {
    setLastRank(youth.rank);
    setDraft(String(youth.rank ?? ""));
  }
  const commit = () => {
    const n = Number(draft);
    if (Number.isInteger(n) && n >= 1 && n !== youth.rank)
      onSetRank(youth.key, n);
    else setDraft(String(youth.rank ?? ""));
  };
  return (
    <Input
      size="sm"
      className="w-12 text-center"
      inputMode="numeric"
      value={draft}
      onChange={(e) =>
        setDraft(e.target.value.replace(/\D/g, ""))
      }
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      aria-label={`Rank for ${youth.name}`}
    />
  );
}

/** An unoccupied physical bed: no youth, X in every month. */
export function OpenBedRow({
  bedNumber,
  months,
}: {
  bedNumber: number;
  months: ProjectionMonth[];
}) {
  return (
    <TableRow>
      <TableCell className="sticky left-0 z-10 bg-card pl-12">
        <div className="flex items-center gap-2">
          <BedLabel>Bed {bedNumber}</BedLabel>
          <span className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
            Open
          </span>
        </div>
      </TableCell>
      <TableCell />
      {months.map((m) => (
        <TableCell key={m.key} className="text-center">
          <ProjectionCodeBadge code="X" />
        </TableCell>
      ))}
      <TableCell />
    </TableRow>
  );
}

export const BedProjectionYouthRow = memo(
  function BedProjectionYouthRow({
    youth,
    months,
    note,
    canEdit,
    canEditCodes,
    onCodeChange,
    onNoteSave,
    onOpen,
    onMove,
    onSetRank,
    isFirst,
    isLast,
    bedNumber,
    overCapacity,
  }: BedProjectionYouthRowProps) {
    const ranked = youth.kind === "anticipated";
    const readmit = youth.youthType === "Readmit";
    return (
      <TableRow tone={readmit ? "accent" : "default"}>
        <TableCell
          className={`sticky left-0 z-10 ${readmit ? "bg-inherit" : "bg-card"} ${ranked ? "pl-6" : "pl-12"}`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            {bedNumber != null && (
              <BedLabel>
                {overCapacity ? "Over" : `Bed ${bedNumber}`}
              </BedLabel>
            )}
            {ranked && (
              <span className="inline-flex items-center gap-1">
                {onSetRank ? (
                  <RankInput
                    youth={youth}
                    onSetRank={onSetRank}
                  />
                ) : (
                  <span
                    className="slds-text-3 font-semibold w-5 text-right"
                    aria-label={`Rank ${youth.rank}`}
                  >
                    {youth.rank}
                  </span>
                )}
                {onMove && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      disabled={isFirst}
                      onClick={() => onMove(youth.key, -1)}
                      aria-label={`Move ${youth.name} up`}
                      title="Move up"
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      disabled={isLast}
                      onClick={() => onMove(youth.key, 1)}
                      aria-label={`Move ${youth.name} down`}
                      title="Move down"
                    >
                      <ArrowDown />
                    </Button>
                  </>
                )}
              </span>
            )}
            <Button
              variant="link-info"
              size="sm"
              className="px-0"
              onClick={() => onOpen(youth.source)}
            >
              {youth.name}
            </Button>
            {readmit && <YouthTypeBadge type="Readmit" />}
            <YouthStatusBadge youth={youth} />
          </div>
        </TableCell>
        <TableCell className="slds-text-3 text-[var(--slds-g-color-text-weak)]">
          {formatMdy(
            youth.dateOfBirth
              ? `${youth.dateOfBirth}T00:00:00`
              : "",
          )}
        </TableCell>
        {months.map((m, i) => {
          if (youth.kind === "anticipated") {
            // Incoming youth carry a Program/month planning tag, not an
            // occupancy code: counted as Reserved / Anticipated.
            const reserved =
              youth.commitmentKind === "reserved";
            return (
              <TableCell key={m.key} className="text-center">
                {youth.commitment[i] ? (
                  <Badge
                    variant={reserved ? "success" : "info"}
                    title={`${reserved ? "Reserved (internal transition)" : "Anticipated"} in ${m.longLabel}`}
                  >
                    {reserved ? "Reserved" : "Anticipated"}
                  </Badge>
                ) : (
                  <span
                    className="slds-text-3 text-[var(--slds-g-color-text-weak)]"
                    aria-label={`Not yet counted in ${m.longLabel}`}
                  >
                    —
                  </span>
                )}
              </TableCell>
            );
          }
          const code = youth.codes[i];
          const seeded = youth.codeSources[i] === "seed";
          return (
            <TableCell
              key={m.key}
              className="text-center"
              title={
                seeded
                  ? "Seeded prototype value — not yet set by staff"
                  : "Set by Admissions Team"
              }
            >
              {canEditCodes ? (
                <Select
                  value={code}
                  onValueChange={(v) =>
                    onCodeChange(
                      youth.key,
                      m.key,
                      v as ProjectionCode,
                    )
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className="w-[76px] mx-auto"
                    aria-label={`${youth.name} ${m.longLabel} occupancy code`}
                  >
                    <SelectValue placeholder="Please Select">
                      <ProjectionCodeBadge code={code} />
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECTION_CODES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        <ProjectionCodeBadge code={c.code} />
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <ProjectionCodeBadge code={code} />
              )}
            </TableCell>
          );
        })}
        <TableCell className="text-center">
          <NoteControl
            youthName={youth.name}
            note={note}
            canEdit={canEdit}
            onSave={(text) => onNoteSave(youth.key, text)}
          />
        </TableCell>
      </TableRow>
    );
  },
);