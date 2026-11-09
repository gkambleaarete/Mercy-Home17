import { type RefObject, useId, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  BULK_TEST_TYPES,
  TYPES_REQUIRING_PANEL,
  isTestPanelDisabled,
  panelsForTestType,
} from "../../lib/substanceTests";

// Add / Modify one Test(s) row of a Bulk Substance Test (20066 AC3/AC4):
// Type + Test Panel, with the individual editor's Type → Panel rules.
// Works on its own draft; the row is handed back only on Save.

export interface BulkTestRow {
  id: number;
  testType: string;
  testPanel: string;
}

function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="slds-text-3 mt-1 text-[#c23934]"
    >
      {message}
    </p>
  );
}

export function BulkTestDefinitionDialog({
  row,
  onSave,
  onClose,
  returnFocusRef,
}: {
  /** Row being modified; omit for Add. */
  row?: BulkTestRow;
  onSave: (value: Omit<BulkTestRow, "id">) => void;
  onClose: () => void;
  /** The button that opened this dialog; focus returns there on close. */
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const uid = useId();
  const ids = {
    description: `${uid}-description`,
    type: `${uid}-type`,
    typeError: `${uid}-type-error`,
    panel: `${uid}-panel`,
    panelError: `${uid}-panel-error`,
  };
  const [testType, setTestType] = useState(row?.testType ?? "");
  const [testPanel, setTestPanel] = useState(
    row?.testPanel ?? "",
  );
  const [errors, setErrors] = useState<{
    testType?: string;
    testPanel?: string;
  }>({});
  const panelOptions = panelsForTestType(testType);
  const panelDisabled = isTestPanelDisabled(testType);

  function handleSave() {
    const next: typeof errors = {};
    if (!testType) next.testType = "Test Type is required.";
    else if (
      TYPES_REQUIRING_PANEL.includes(testType) &&
      !testPanel
    )
      next.testPanel =
        "Test Panel is required for this test type.";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSave({ testType, testPanel });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        size="md"
        aria-describedby={ids.description}
        // Radix returns focus to a Dialog.Trigger; this dialog is opened
        // from state, so return it to the opening button explicitly.
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          returnFocusRef?.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {row ? "Modify Test" : "Add Test"}
          </DialogTitle>
          {/* id on the inner span: DialogDescription keeps Radix's own id
              (see SubstanceUseTestingModals). */}
          <DialogDescription>
            <span id={ids.description}>
              Choose the test Type and Test Panel used for every
              youth in this Bulk Substance Test.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div>
            <label
              htmlFor={ids.type}
              className="slds-form-label block mb-1.5 text-[var(--slds-g-color-text-weak)]"
            >
              Type<span className="text-[#c23934]"> *</span>
            </label>
            <Select
              value={testType}
              onValueChange={(v) => {
                // Same as the individual editor: a new Type clears Panel.
                setTestType(v);
                setTestPanel("");
                setErrors({});
              }}
            >
              <SelectTrigger
                id={ids.type}
                surface="base"
                aria-required
                aria-invalid={!!errors.testType}
                aria-describedby={
                  errors.testType ? ids.typeError : undefined
                }
              >
                <SelectValue placeholder="Select test type..." />
              </SelectTrigger>
              <SelectContent>
                {BULK_TEST_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError
              id={ids.typeError}
              message={errors.testType}
            />
          </div>
          <div>
            <label
              htmlFor={ids.panel}
              className="slds-form-label block mb-1.5 text-[var(--slds-g-color-text-weak)]"
            >
              Test Panel
              {TYPES_REQUIRING_PANEL.includes(testType) && (
                <span className="text-[#c23934]"> *</span>
              )}
            </label>
            <Select
              value={testPanel}
              onValueChange={(v) => {
                setTestPanel(v);
                setErrors((e) => ({
                  ...e,
                  testPanel: undefined,
                }));
              }}
              disabled={panelDisabled}
            >
              <SelectTrigger
                id={ids.panel}
                surface="base"
                aria-invalid={!!errors.testPanel}
                aria-describedby={
                  errors.testPanel ? ids.panelError : undefined
                }
              >
                <SelectValue
                  placeholder={
                    testType === "Lab Test"
                      ? "No panel for Lab Test"
                      : "Select test panel..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {panelOptions.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError
              id={ids.panelError}
              message={errors.testPanel}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}