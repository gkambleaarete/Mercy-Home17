import { Card } from "../ui/card";
import { DateInput } from "../ui/date-input";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
import { Textarea } from "../ui/textarea";
import {
  PLANNED_STATUS_OPTIONS,
  type InternalTransitionDetails,
  type PlannedStatus,
} from "../../data/transitionSummaryStore";
import {
  communityCareContactOptions,
  constituentLabel,
  programLabel,
  youthPrimaryContact,
  youthProgramOptions,
  type IdOption,
} from "../../data/transitionSummaryDetailsSources";

// Internal Transition Summary → Details (US 20101). Controlled by the
// parent's draft; this component never reads or writes the store.

const TRANSITION_TYPE_LABEL = "Internal Transition";

export interface DetailsErrors {
  transitionDate?: string;
  programId?: string;
  communityCareContactId?: string;
}

/** Options for a saved ID: valid choices plus, when the saved value is no
 *  longer valid, that value so it still displays (and can't be re-chosen). */
function withSaved(
  options: IdOption[],
  saved: number | undefined,
  label: (id: number) => string | undefined,
  suffix: string,
) {
  if (
    saved === undefined ||
    options.some((o) => o.id === saved)
  )
    return { options, unavailable: undefined };
  return {
    options,
    unavailable: {
      id: saved,
      label: `${label(saved) ?? `Record ${saved}`} (${suffix})`,
    },
  };
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  return msg ? (
    <p
      id={id}
      role="alert"
      className="slds-text-3 text-destructive"
    >
      {msg}
    </p>
  ) : null;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h4 className="slds-text-5 font-semibold text-[var(--slds-g-color-text-default)]">
        {title}
      </h4>
      {children}
    </section>
  );
}

function ReadValue({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value?: string;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-1.5 min-w-0">
      <p className="slds-form-label text-[var(--slds-g-color-text-weak)]">
        {label}
      </p>
      <p
        className={`slds-text-4 text-[var(--slds-g-color-text-default)] break-words${multiline ? " whitespace-pre-wrap" : ""}`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function IdSelect({
  id,
  label,
  value,
  savedValue,
  options,
  unavailableLabel,
  emptyText,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value?: number;
  savedValue?: number;
  options: IdOption[];
  unavailableLabel: (id: number) => string | undefined;
  emptyText: string;
  error?: string;
  onChange: (v: number | undefined) => void;
}) {
  const { unavailable } = withSaved(
    options,
    savedValue,
    unavailableLabel,
    "no longer available",
  );
  const noChoices = options.length === 0 && !unavailable;
  const errId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="slds-form-label">
        {label}
      </Label>
      <Select
        value={value === undefined ? "" : String(value)}
        onValueChange={(v) =>
          onChange(v ? Number(v) : undefined)
        }
        disabled={noChoices}
      >
        <SelectTrigger
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [error && errId, noChoices && hintId]
              .filter(Boolean)
              .join(" ") || undefined
          }
        >
          <SelectValue
            placeholder={
              noChoices ? "None available" : `Select ${label}`
            }
          />
        </SelectTrigger>
        <SelectContent>
          {unavailable && (
            <SelectItem value={String(unavailable.id)} disabled>
              {unavailable.label}
            </SelectItem>
          )}
          {options.map((o) => (
            <SelectItem key={o.id} value={String(o.id)}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {noChoices && (
        <p
          id={hintId}
          className="slds-text-3 text-[var(--slds-g-color-text-weak)]"
        >
          {emptyText}
        </p>
      )}
      <FieldError id={errId} msg={error} />
    </div>
  );
}

function YouthContactTable({ youthId }: { youthId: string }) {
  const c = youthPrimaryContact(youthId);
  return (
    <Section title="Youth Primary Contact Information">
      <Card variant="container">
        <Table>
          <TableHeader>
            <TableRow hoverable={false}>
              {["Name", "Phone", "Email", "Address"].map(
                (h) => (
                  <TableHead key={h} variant="slds">
                    {h}
                  </TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow hoverable={false}>
              {[c.name, c.phone, c.email, c.address].map(
                (v, i) => (
                  <TableCell key={i} wrap={i === 3}>
                    {v || "—"}
                  </TableCell>
                ),
              )}
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </Section>
  );
}

export function InternalTransitionDetailsForm({
  youthId,
  draft,
  saved,
  readOnly,
  errors,
  onChange,
  contactsSection,
}: {
  youthId: string;
  draft: InternalTransitionDetails;
  /** Latest saved details — a saved but no-longer-valid ID stays shown. */
  saved: InternalTransitionDetails;
  readOnly: boolean;
  errors: DetailsErrors;
  onChange: (next: InternalTransitionDetails) => void;
  /** Placement Details → Contacts, owned by the summary editor. */
  contactsSection?: React.ReactNode;
}) {
  const programs = youthProgramOptions(youthId);
  const contacts = communityCareContactOptions();
  const set = <K extends keyof InternalTransitionDetails>(
    k: K,
    v: InternalTransitionDetails[K],
  ) => onChange({ ...draft, [k]: v });

  if (readOnly) {
    const program =
      draft.programId !== undefined
        ? (programLabel(draft.programId) ??
          `Record ${draft.programId}`)
        : "";
    const contact =
      draft.communityCareContactId !== undefined
        ? (constituentLabel(draft.communityCareContactId) ??
          `Record ${draft.communityCareContactId}`)
        : "";
    return (
      <div className="space-y-6">
        <Section title="Transition Information">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <ReadValue
              label="Transition Date"
              value={draft.transitionDate}
            />
            <ReadValue
              label="Planned/Unplanned"
              value={draft.plannedStatus}
            />
            <ReadValue
              label="Transition Type"
              value={TRANSITION_TYPE_LABEL}
            />
            <ReadValue
              label="Associated Program"
              value={program}
            />
            <ReadValue
              label="Community Care Contact"
              value={contact}
            />
          </div>
        </Section>
        <YouthContactTable youthId={youthId} />
        <Section title="Placement Details">
          <ReadValue
            label="Description"
            value={draft.placementDescription}
            multiline
          />
          {contactsSection}
        </Section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Section title="Transition Information">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="its-transition-date"
              className="slds-form-label"
            >
              Transition Date
            </Label>
            <DateInput
              id="its-transition-date"
              value={draft.transitionDate ?? ""}
              onChange={(v) => set("transitionDate", v)}
              aria-invalid={
                errors.transitionDate ? true : undefined
              }
              aria-describedby={
                errors.transitionDate
                  ? "its-transition-date-error"
                  : undefined
              }
            />
            <FieldError
              id="its-transition-date-error"
              msg={errors.transitionDate}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="its-planned"
              className="slds-form-label"
            >
              Planned/Unplanned
            </Label>
            <Select
              value={draft.plannedStatus ?? ""}
              onValueChange={(v) =>
                set("plannedStatus", v as PlannedStatus)
              }
            >
              <SelectTrigger id="its-planned">
                <SelectValue placeholder="Select Planned/Unplanned" />
              </SelectTrigger>
              <SelectContent>
                {PLANNED_STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="its-transition-type"
              className="slds-form-label"
            >
              Transition Type
            </Label>
            <Input
              id="its-transition-type"
              value={TRANSITION_TYPE_LABEL}
              readOnly
            />
          </div>
          <IdSelect
            id="its-program"
            label="Associated Program"
            value={draft.programId}
            savedValue={saved.programId}
            options={programs}
            unavailableLabel={programLabel}
            emptyText="No program associations found for this youth."
            error={errors.programId}
            onChange={(v) => set("programId", v)}
          />
          <IdSelect
            id="its-cc-contact"
            label="Community Care Contact"
            value={draft.communityCareContactId}
            savedValue={saved.communityCareContactId}
            options={contacts}
            unavailableLabel={constituentLabel}
            emptyText="No active Community Care Staff are available."
            error={errors.communityCareContactId}
            onChange={(v) => set("communityCareContactId", v)}
          />
        </div>
      </Section>

      <YouthContactTable youthId={youthId} />

      <Section title="Placement Details">
        <div className="space-y-1.5">
          <Label
            htmlFor="its-placement-description"
            className="slds-form-label"
          >
            Description
          </Label>
          <Textarea
            id="its-placement-description"
            value={draft.placementDescription ?? ""}
            onChange={(e) =>
              set("placementDescription", e.target.value)
            }
            placeholder="Describe the placement"
          />
        </div>
        {contactsSection}
      </Section>
    </div>
  );
}