import { Ban, AlertCircle } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { EmptyState } from "../ui/empty-state";
import { FieldError, FieldLabel } from "../ui/field";
import { DateInput } from "../ui/date-input";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { isValidMdy } from "../../data/mockProgramsData";

interface LeadDetailCampusRestrictionsTabProps {
  MHGB_STAFF: any;
  RESTRICTION_TYPES: any;
  YOUTH_CONSTITUENTS: any;
  activeTab: any;
  campusRestrictions: any;
  crDialogOpen: any;
  crEditingId: any;
  crForm: any;
  crSelectedId: any;
  openCrAdd: any;
  openCrModify: any;
  /** True when saved restrictions could not be read (not the same as empty). */
  restrictionsReadFailed?: boolean;
  s: any;
  saveCrForm: any;
  setCrDialogOpen: any;
  setCrForm: any;
  setCrSelectedId: any;
}

const COLUMNS = [
  "YOUTH",
  "TYPE",
  "START DATE",
  "END DATE",
  "IMPLEMENTED BY",
  "CAMPUS CONTACT",
  "RESTORATIVE MEASURES",
  "ENDED BY",
];

// Radix Select cannot hold "" as an item value: this clears an optional field.
const NONE = "__none__";

export function LeadDetailCampusRestrictionsTab({ MHGB_STAFF, RESTRICTION_TYPES, YOUTH_CONSTITUENTS, activeTab, campusRestrictions, crDialogOpen, crEditingId, crForm, crSelectedId, openCrAdd, openCrModify, restrictionsReadFailed = false, saveCrForm, setCrDialogOpen, setCrForm, setCrSelectedId }: LeadDetailCampusRestrictionsTabProps) {
  if (activeTab !== "campusRestrictions") return null;

  const set = (field: string, value: string) =>
    setCrForm((f: any) => ({ ...f, [field]: value }));

  // A typed date must be complete and real before it can be saved (blank
  // End Date is fine; Start Date is required).
  const startInvalid = !!crForm.startDate && !isValidMdy(crForm.startDate);
  const endInvalid = !!crForm.endDate && !isValidMdy(crForm.endDate);
  const canSave =
    !!crForm.youth && !!crForm.type && !!crForm.startDate && !startInvalid && !endInvalid;

  const select = (
    field: string,
    id: string,
    options: string[],
    opts: { required?: boolean } = {},
  ) => {
    const value: string = crForm[field];
    const missing = !!opts.required && !value;
    return (
      <>
        <Select
          value={value}
          onValueChange={(v) => set(field, v === NONE ? "" : v)}
        >
          <SelectTrigger
            id={id}
            surface="base"
            className="w-full"
            aria-invalid={missing}
            aria-describedby={missing ? `${id}-error` : undefined}
          >
            <SelectValue placeholder="Please Select" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            sideOffset={4}
            className="max-h-[240px] overflow-y-auto"
          >
            {options.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
            {!opts.required && value && (
              <SelectItem value={NONE}>None</SelectItem>
            )}
          </SelectContent>
        </Select>
        {missing && <FieldError id={`${id}-error`}>Required</FieldError>}
      </>
    );
  };

  return (
    <div className="space-y-4">
      {/* Section header */}
      <section
        aria-labelledby="cr-heading"
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor: "var(--slds-g-color-background-base)",
        }}
      >
        <div
          className="px-4 py-3 flex items-center justify-between gap-4"
          style={{
            borderBottom: restrictionsReadFailed
              ? "none"
              : "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor: "var(--slds-g-color-background-alt)",
          }}
        >
          <div className="flex items-center gap-3">
            <h3
              id="cr-heading"
              className="text-[13px] font-semibold"
              style={{ color: "var(--slds-g-color-text-default)" }}
            >
              Campus Restrictions
            </h3>
            {!restrictionsReadFailed && (
              <Badge variant="success">{campusRestrictions.length}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openCrModify}
              disabled={crSelectedId === null || restrictionsReadFailed}
            >
              Modify
            </Button>
            <Button
              size="sm"
              onClick={openCrAdd}
              disabled={restrictionsReadFailed}
            >
              + Add
            </Button>
          </div>
        </div>

        {restrictionsReadFailed ? null : campusRestrictions.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Ban}
              title="No campus restrictions found"
              description='Click "Add" to create one.'
              className="py-6"
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <RadioGroup
                value={crSelectedId === null ? "" : String(crSelectedId)}
                onValueChange={(v) => setCrSelectedId(Number(v))}
                aria-label="Select a campus restriction"
                className="block"
              >
                <Table style={{ minWidth: "900px" }}>
                  <TableHeader>
                    <TableRow>
                      <TableHead variant="slds" size="md" className="w-10 px-2">
                        <span className="sr-only">Select</span>
                      </TableHead>
                      {COLUMNS.map((h) => (
                        <TableHead key={h} variant="slds" size="md">
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campusRestrictions.map((r: any) => {
                      const selected = r.id === crSelectedId;
                      return (
                        <TableRow
                          key={r.id}
                          data-state={selected ? "selected" : undefined}
                          onClick={() =>
                            setCrSelectedId(selected ? null : r.id)
                          }
                          className="cursor-pointer"
                        >
                          <TableCell className="px-2 text-center">
                            <RadioGroupItem
                              value={String(r.id)}
                              aria-label={`Select ${r.type} for ${r.youth}`}
                              onClick={(e) => {
                                // Row click toggles; the radio itself selects.
                                e.stopPropagation();
                                setCrSelectedId(r.id);
                              }}
                            />
                          </TableCell>
                          <TableCell
                            wrap
                            className="px-4 text-[var(--color-link-blue)]"
                          >
                            {r.youth}
                          </TableCell>
                          <TableCell className="px-4">{r.type}</TableCell>
                          <TableCell className="px-4">{r.startDate}</TableCell>
                          <TableCell className="px-4">{r.endDate || "—"}</TableCell>
                          <TableCell wrap className="px-4">
                            {r.implementedBy || "—"}
                          </TableCell>
                          <TableCell wrap className="px-4">
                            {r.campusContact || "—"}
                          </TableCell>
                          <TableCell className="px-4 max-w-[180px]">
                            <span
                              className="truncate block"
                              title={r.restorativeMeasureDetails}
                            >
                              {r.restorativeMeasureDetails || "—"}
                            </span>
                          </TableCell>
                          <TableCell wrap className="px-4">
                            {r.endedBy || "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </RadioGroup>
            </div>
            <div
              className="px-4 py-2.5 border-t border-border text-[length:var(--slds-g-font-size-3)]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              {campusRestrictions.length} record
              {campusRestrictions.length !== 1 ? "s" : ""}
              {crSelectedId ? " · 1 selected" : ""}
            </div>
          </>
        )}
      </section>

      {restrictionsReadFailed && (
        <Alert variant="error" role="alert">
          <AlertCircle aria-hidden="true" />
          <AlertDescription>
            Saved campus restrictions can't be read, so none are shown and restrictions can't be added or changed. The saved data has been left as it is.
          </AlertDescription>
        </Alert>
      )}

      {/* Add / Modify dialog */}
      <Dialog
        open={!!crDialogOpen}
        onOpenChange={(open) => !open && setCrDialogOpen(false)}
      >
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>
              {crEditingId !== null
                ? "Modify Campus Restriction"
                : "Add Campus Restriction"}
            </DialogTitle>
            <DialogDescription>
              {crEditingId !== null
                ? "Updates this campus restriction. Youth, Type and Start Date are required."
                : "Records a campus restriction for a youth. Youth, Type and Start Date are required."}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <FieldLabel htmlFor="cr-youth" required>
                  YOUTH
                </FieldLabel>
                {select("youth", "cr-youth", YOUTH_CONSTITUENTS, {
                  required: true,
                })}
              </div>
              <div>
                <FieldLabel htmlFor="cr-type" required>
                  TYPE
                </FieldLabel>
                {select("type", "cr-type", RESTRICTION_TYPES, {
                  required: true,
                })}
              </div>
              <div>
                <FieldLabel htmlFor="cr-start" required error={startInvalid}>
                  START DATE
                </FieldLabel>
                <DateInput
                  id="cr-start"
                  value={crForm.startDate}
                  onChange={(v) => set("startDate", v)}
                  aria-invalid={startInvalid || !crForm.startDate}
                  aria-describedby={
                    !crForm.startDate || startInvalid
                      ? "cr-start-error"
                      : undefined
                  }
                />
                {!crForm.startDate && (
                  <FieldError id="cr-start-error">Required</FieldError>
                )}
                {startInvalid && (
                  <FieldError id="cr-start-error">
                    Enter a valid date (MM/DD/YYYY).
                  </FieldError>
                )}
              </div>
              <div>
                <FieldLabel htmlFor="cr-end" error={endInvalid}>
                  END DATE
                </FieldLabel>
                <DateInput
                  id="cr-end"
                  value={crForm.endDate}
                  onChange={(v) => set("endDate", v)}
                  aria-invalid={endInvalid}
                  aria-describedby={endInvalid ? "cr-end-error" : undefined}
                />
                {endInvalid && (
                  <FieldError id="cr-end-error">
                    Enter a valid date (MM/DD/YYYY).
                  </FieldError>
                )}
              </div>
              <div>
                <FieldLabel htmlFor="cr-implemented">IMPLEMENTED BY</FieldLabel>
                {select("implementedBy", "cr-implemented", MHGB_STAFF)}
              </div>
              <div>
                <FieldLabel htmlFor="cr-contact">CAMPUS CONTACT</FieldLabel>
                {select("campusContact", "cr-contact", MHGB_STAFF)}
              </div>
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="cr-reason">RESTRICTION REASON</FieldLabel>
                <Textarea
                  id="cr-reason"
                  size="md"
                  surface="base"
                  rows={3}
                  value={crForm.restrictionReason}
                  onChange={(e) => set("restrictionReason", e.target.value)}
                  placeholder="Enter free text explanation…"
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel htmlFor="cr-restorative">
                  RESTORATIVE MEASURE DETAILS
                </FieldLabel>
                <Textarea
                  id="cr-restorative"
                  size="md"
                  surface="base"
                  rows={3}
                  value={crForm.restorativeMeasureDetails}
                  onChange={(e) =>
                    set("restorativeMeasureDetails", e.target.value)
                  }
                  placeholder="Describe restorative measures…"
                />
              </div>
              <div>
                <FieldLabel htmlFor="cr-ended">ENDED BY</FieldLabel>
                {select("endedBy", "cr-ended", MHGB_STAFF)}
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCrDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCrForm} disabled={!canSave}>
              {crEditingId !== null ? "Save Changes" : "Add Restriction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
