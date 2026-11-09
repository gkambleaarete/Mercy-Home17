// Renders the US 20040 intake questionnaires from the definitions in
// data/ffMenteeIntake.ts: one bordered group per questionnaire section,
// readable question labels, Short Text → Input, Large Text → Textarea,
// Picklist → Select, and editable grids with stable row ids. Only the items
// that apply to the selected Sub-Program are rendered.

import { Plus, Trash2 } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type {
  FFGridRow,
  FFSubProgramme,
} from "../../data/mockFriendsFirstData";
import {
  type Answers,
  type Grids,
  type QField,
  type QGrid,
  type QGroup,
  type QItem,
  appliesTo,
  gridCellId,
  isRequired,
  newRowId,
  visibleGroups,
  visibleItems,
} from "../../data/ffMenteeIntake";

const BORDER = "1px solid var(--slds-g-color-border-base-1)";

export function FieldError({
  id,
  msg,
}: {
  id: string;
  msg?: string;
}) {
  if (!msg) return null;
  return (
    <p
      id={`${id}-error`}
      className="mt-1 text-[12px]"
      style={{ color: "#c23934" }}
    >
      {msg}
    </p>
  );
}

/** Readable, sentence-case question label (not the 11px uppercase label). */
export function QuestionLabel({
  htmlFor,
  required,
  context,
  children,
}: {
  htmlFor?: string;
  required?: boolean;
  context?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block mb-1.5 text-[13px] font-medium leading-snug"
      style={{ color: "var(--slds-g-color-text-default)" }}
    >
      {children}
      {required && (
        <span className="text-red-600" aria-hidden="true">
          {" "}
          *
        </span>
      )}
      {required && <span className="sr-only"> (required)</span>}
      {context && <span className="sr-only"> — {context}</span>}
    </label>
  );
}

export function GroupSection({
  title,
  first,
  children,
}: {
  title: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className="p-6"
      style={!first ? { borderTop: BORDER } : undefined}
      aria-label={title}
    >
      <h3 className="slds-section-title text-[var(--slds-g-color-text-default)] mb-4">
        {title}
      </h3>
      {children}
    </section>
  );
}

interface Props {
  groups: QGroup[];
  programme: FFSubProgramme;
  answers: Answers;
  grids: Grids;
  errors: Record<string, string>;
  onAnswer: (key: string, value: string) => void;
  onGrid: (key: string, rows: FFGridRow[]) => void;
  /** Structured blocks (guardian contact, availability) rendered by the page. */
  renderSpecial?: (kind: string) => React.ReactNode;
  /** True when the first rendered group follows other content. */
  continued?: boolean;
}

export function IntakeQuestionnaire({
  groups,
  programme,
  answers,
  grids,
  errors,
  onAnswer,
  onGrid,
  renderSpecial,
  continued,
}: Props) {
  const renderField = (fl: QField) => {
    if (!appliesTo(fl.programs, programme)) return null;
    const req = isRequired(fl, answers, programme);
    const err = errors[fl.key];
    const describedBy =
      [fl.hint && `${fl.key}-hint`, err && `${fl.key}-error`]
        .filter(Boolean)
        .join(" ") || undefined;
    const value = answers[fl.key] ?? "";
    return (
      <div
        key={fl.key}
        className={
          fl.type === "large" ? "lg:col-span-2" : undefined
        }
      >
        <QuestionLabel
          htmlFor={fl.key}
          required={req}
          context={fl.context}
        >
          {fl.label}
        </QuestionLabel>
        {fl.type === "large" ? (
          <Textarea
            id={fl.key}
            size="md"
            rows={3}
            value={value}
            aria-invalid={!!err}
            aria-describedby={describedBy}
            onChange={(e) => onAnswer(fl.key, e.target.value)}
          />
        ) : fl.type === "picklist" ? (
          <Select
            value={value}
            onValueChange={(v) => onAnswer(fl.key, v)}
            disabled={!fl.options?.length}
          >
            <SelectTrigger
              surface="base"
              id={fl.key}
              className="h-9 w-full slds-text-4"
              aria-invalid={!!err}
              aria-describedby={describedBy}
            >
              <SelectValue
                placeholder={
                  fl.options?.length
                    ? "Please Select"
                    : "Options pending — not yet defined"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {(fl.options ?? []).map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            surface="base"
            id={fl.key}
            className="h-9 text-[13px]"
            value={value}
            aria-invalid={!!err}
            aria-describedby={describedBy}
            onChange={(e) => onAnswer(fl.key, e.target.value)}
          />
        )}
        {fl.hint && (
          <p
            id={`${fl.key}-hint`}
            className="mt-1 text-[12px]"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            {fl.hint}
          </p>
        )}
        {fl.type === "picklist" && !fl.options?.length && (
          <p
            className="mt-1 text-[12px]"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            The approved choices for this picklist have not been
            provided yet.
          </p>
        )}
        <FieldError id={fl.key} msg={err} />
      </div>
    );
  };

  const renderItem = (it: QItem, i: number) => {
    switch (it.kind) {
      case "field":
        return renderField(it);
      case "prompt": {
        const children = it.fields.filter((fl) =>
          appliesTo(fl.programs, programme),
        );
        if (!children.length) return null;
        return (
          <fieldset
            key={`p-${i}`}
            className="lg:col-span-2 pl-4"
            style={{
              borderLeft:
                "3px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <legend
              className="mb-3 text-[13px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {it.label}
            </legend>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
              {children.map(renderField)}
            </div>
          </fieldset>
        );
      }
      case "grid":
        return (
          <div key={it.key} className="lg:col-span-2">
            <GridEditor
              grid={it}
              rows={grids[it.key] ?? []}
              errors={errors}
              onChange={(rows) => onGrid(it.key, rows)}
            />
          </div>
        );
      default:
        return (
          <div key={`s-${i}`} className="lg:col-span-2">
            {renderSpecial?.(it.kind)}
          </div>
        );
    }
  };

  return (
    <>
      {visibleGroups(groups, programme).map((g, gi) => (
        <GroupSection
          key={g.id}
          title={g.title}
          first={gi === 0 && !continued}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">
            {visibleItems(g, programme).map(renderItem)}
          </div>
        </GroupSection>
      ))}
    </>
  );
}

// ─── Editable grid ──────────────────────────────────────────────────────────

function GridEditor({
  grid,
  rows,
  errors,
  onChange,
}: {
  grid: QGrid;
  rows: FFGridRow[];
  errors: Record<string, string>;
  onChange: (rows: FFGridRow[]) => void;
}) {
  const gridErr = errors[grid.key];
  const headingId = `${grid.key}-heading`;
  const addRow = () =>
    onChange([
      ...rows,
      Object.fromEntries([
        ["id", newRowId()],
        ...grid.columns.map((c) => [c.key, ""]),
      ]) as FFGridRow,
    ]);
  const setCell = (rowId: string, col: string, v: string) =>
    onChange(
      rows.map((r) =>
        r.id === rowId ? { ...r, [col]: v } : r,
      ),
    );
  const removeRow = (rowId: string) =>
    onChange(rows.filter((r) => r.id !== rowId));

  return (
    <div
      id={grid.key}
      tabIndex={-1}
      role="group"
      aria-labelledby={headingId}
      aria-describedby={
        gridErr ? `${grid.key}-error` : undefined
      }
      className="outline-none"
    >
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <p
          id={headingId}
          className="text-[13px] font-semibold"
          style={{ color: "var(--slds-g-color-text-default)" }}
        >
          {grid.label}
          {grid.minRows ? (
            <>
              <span className="text-red-600" aria-hidden="true">
                {" "}
                *
              </span>
              <span className="sr-only"> (required)</span>
            </>
          ) : null}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
        >
          <Plus aria-hidden="true" />
          {grid.addLabel}
        </Button>
      </div>
      <div
        className="overflow-x-auto rounded-lg"
        style={{ border: BORDER }}
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {grid.columns.map((c) => (
                <TableHead
                  key={c.key}
                  className="px-3 min-w-[160px]"
                >
                  {c.label}
                  {c.required && (
                    <span
                      className="text-red-600"
                      aria-hidden="true"
                    >
                      {" "}
                      *
                    </span>
                  )}
                </TableHead>
              ))}
              <TableHead className="px-3 w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow hoverable={false}>
                <TableCell
                  colSpan={grid.columns.length + 1}
                  className="px-3 py-4 text-center text-[13px]"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                  }}
                >
                  No entries.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, ri) => (
                <TableRow key={row.id} hoverable={false}>
                  {grid.columns.map((c) => {
                    const id = gridCellId(
                      grid.key,
                      row.id,
                      c.key,
                    );
                    const err = errors[id];
                    return (
                      <TableCell
                        key={c.key}
                        className="px-3 align-top"
                      >
                        <Input
                          surface="base"
                          id={id}
                          className="h-9 text-[13px]"
                          aria-label={`${grid.label} row ${ri + 1}: ${c.label}${c.required ? " (required)" : ""}`}
                          aria-invalid={!!err}
                          aria-describedby={
                            err ? `${id}-error` : undefined
                          }
                          value={row[c.key] ?? ""}
                          onChange={(e) =>
                            setCell(
                              row.id,
                              c.key,
                              e.target.value,
                            )
                          }
                        />
                        <FieldError id={id} msg={err} />
                      </TableCell>
                    );
                  })}
                  <TableCell className="px-3 align-top">
                    <Button
                      type="button"
                      variant="ghost-destructive"
                      size="icon-xs"
                      aria-label={`Remove ${grid.label} row ${ri + 1}`}
                      onClick={() => removeRow(row.id)}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <FieldError id={grid.key} msg={gridErr} />
    </div>
  );
}

/**
 * Focuses and scrolls to the first invalid control, in DOM order. Runs on
 * the next frame — after React has committed the error state — so the
 * control's aria-invalid / aria-describedby already point at the rendered
 * error text when focus (and the screen reader) lands on it.
 */
export function focusFirstError(
  errors: Record<string, string>,
) {
  const ids = Object.keys(errors);
  if (!ids.length) return;
  requestAnimationFrame(() => focusNow(ids));
}

function focusNow(ids: string[]) {
  const els = ids
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => !!el)
    .sort((a, b) =>
      a.compareDocumentPosition(b) &
      Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1,
    );
  const el = els[0];
  if (!el) return;
  el.scrollIntoView({ block: "center", behavior: "smooth" });
  el.focus({ preventScroll: true });
}