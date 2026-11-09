import { useId } from "react";
import { Button } from "../ui/button";
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
import type { ProgramSubstanceTest } from "../../data/mockSubstanceTestData";
import { getYouthNames } from "../../data/mockYouthProgramData";
import { formatSampleDateTime } from "./substanceTestDateTime";
import { restoreFocus } from "./focusReturn";

// Read-only View of one Program Substance Test (20065 AC11). Shows every
// stored field, including each test's results and notifications. Nothing
// here can write to the store.

// Read-only label + value — plain text, never boxed like an input (same
// treatment as PassForm / ProgramRecordPage view mode).
function ReadField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="slds-form-label mb-1.5 text-[var(--slds-g-color-text-weak)]">
        {label}
      </dt>
      <dd className="slds-text-4 whitespace-pre-wrap break-words text-[var(--slds-g-color-text-default)]">
        {value || "—"}
      </dd>
    </div>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h3 className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)]">
      {children}
    </h3>
  );
}

export function SubstanceTestViewDialog({
  test,
  programName,
  onClose,
  returnFocusTo,
  fallbackFocusId,
}: {
  test: ProgramSubstanceTest | null;
  programName: string;
  onClose: () => void;
  /** The control that opened the dialog; focus returns to it on close. */
  returnFocusTo?: () => HTMLElement | null;
  /** Element id to focus if that control is gone or disabled. */
  fallbackFocusId?: string;
}) {
  const descriptionId = useId();
  const youth = test ? getYouthNames([test.constituentId]) : "";

  return (
    <Dialog
      open={!!test}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent
        size="xl"
        aria-describedby={descriptionId}
        // Opened from state, not a Dialog.Trigger: return focus explicitly
        // (Escape, Close and the corner close button all end here).
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          restoreFocus(returnFocusTo?.(), fallbackFocusId);
        }}
      >
        <DialogHeader>
          <DialogTitle>Substance Test</DialogTitle>
          {/* id on the inner span: DialogDescription keeps Radix's own id
              (see SubstanceUseTestingModals). */}
          <DialogDescription>
            <span id={descriptionId}>
              {youth || "Unknown youth"} · {programName} · Read
              only
            </span>
          </DialogDescription>
        </DialogHeader>
        {test && (
          <DialogBody className="space-y-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <ReadField label="Youth" value={youth} />
              <ReadField label="Program" value={programName} />
              <ReadField
                label="Sample Date / Time"
                value={formatSampleDateTime(
                  test.sampleDateTime,
                )}
              />
              <ReadField
                label="Test Reason"
                value={test.reason}
              />
              <ReadField
                label="Results Indicate New Use"
                value={test.newUse}
              />
              <ReadField
                label="Bulk Substance Test"
                value={
                  test.bulkTestId === null
                    ? "No"
                    : "Yes — created from a Bulk Substance Test"
                }
              />
            </dl>

            <section className="space-y-4">
              <SectionHeading>Tests</SectionHeading>
              {test.testDetails.length === 0 ? (
                <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
                  No tests recorded.
                </p>
              ) : (
                test.testDetails.map((d, i) => (
                  <div key={d.id} className="space-y-3">
                    <p className="slds-text-4 font-semibold text-[var(--slds-g-color-text-default)]">
                      Test {i + 1}
                    </p>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      <ReadField
                        label="Test Type"
                        value={d.testType}
                      />
                      <ReadField
                        label="Test Panel"
                        value={d.testPanel}
                      />
                      <ReadField
                        label="Related Test"
                        value={d.relatedTest}
                      />
                      <ReadField
                        label="Refusal Detail"
                        value={d.refusalDetail}
                      />
                      <ReadField
                        label="Results Date"
                        value={d.resultsDate}
                      />
                      <ReadField
                        label="Results Time"
                        value={d.resultsTime}
                      />
                      <ReadField
                        label="Staff Administering"
                        value={d.staffAdministering}
                      />
                    </dl>
                    {d.testResults.length === 0 ? (
                      <p className="slds-text-4 text-[var(--slds-g-color-text-weak)]">
                        No substance results recorded.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow hoverable={false}>
                              <TableHead variant="slds">
                                Substance
                              </TableHead>
                              <TableHead variant="slds">
                                Result
                              </TableHead>
                              <TableHead variant="slds">
                                Level
                              </TableHead>
                              <TableHead variant="slds">
                                Units
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {d.testResults.map((r) => (
                              <TableRow
                                key={r.id}
                                hoverable={false}
                              >
                                <TableCell>
                                  {r.substance || "—"}
                                </TableCell>
                                <TableCell>
                                  {r.result || "—"}
                                </TableCell>
                                <TableCell>
                                  {r.level || "—"}
                                </TableCell>
                                <TableCell>
                                  {r.units || "—"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    {(d.notifications ?? []).length > 0 && (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow hoverable={false}>
                              <TableHead variant="slds">
                                Notified
                              </TableHead>
                              <TableHead variant="slds">
                                By
                              </TableHead>
                              <TableHead variant="slds">
                                Persons Notified
                              </TableHead>
                              <TableHead variant="slds">
                                Contact Type
                              </TableHead>
                              <TableHead variant="slds">
                                Status
                              </TableHead>
                              <TableHead variant="slds">
                                Notes
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(d.notifications ?? []).map(
                              (n) => (
                                <TableRow
                                  key={n.id}
                                  hoverable={false}
                                >
                                  <TableCell>
                                    {[n.date, n.time]
                                      .filter(Boolean)
                                      .join(" ") || "—"}
                                  </TableCell>
                                  <TableCell>
                                    {n.notifiedBy || "—"}
                                  </TableCell>
                                  <TableCell>
                                    {n.personsNotified
                                      .map((p) => p.name)
                                      .join(", ") || "—"}
                                  </TableCell>
                                  <TableCell>
                                    {n.contactType || "—"}
                                  </TableCell>
                                  <TableCell>
                                    {n.status || "—"}
                                  </TableCell>
                                  <TableCell>
                                    {n.notes || "—"}
                                  </TableCell>
                                </TableRow>
                              ),
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                ))
              )}
            </section>

            <section className="space-y-4">
              <SectionHeading>
                Additional Details
              </SectionHeading>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <ReadField
                  label="Suspect Tampering"
                  value={test.suspectTampering ? "Yes" : "No"}
                />
                <ReadField
                  label="Tampering Comments"
                  value={test.tamperingComments}
                />
                <ReadField
                  label="Lab Consultation"
                  value={test.labConsultation}
                />
                <ReadField label="Action" value={test.action} />
                <ReadField
                  label="Refrigerator Date"
                  value={test.refrigeratorDate}
                />
                <ReadField
                  label="Pickup Date"
                  value={test.pickupDate}
                />
                <ReadField
                  label="Discard Date"
                  value={test.discardDate}
                />
                <ReadField
                  label="Discard Reason"
                  value={test.discardReason}
                />
              </dl>
            </section>
          </DialogBody>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}