import { useRef, useState } from "react";
import { toast } from "sonner";
import { SubstanceUseTestingModals } from "../admissions/SubstanceUseTestingModals";
import { createProgramSubstanceTest } from "../../data/mockSubstanceTestData";
import {
  type ModalTest,
  toStorePatch,
} from "./SubstanceTestEditDialog";
import { anyDialogOpen, restoreFocus } from "./focusReturn";

// Youth Profile → create an individual Substance Test (20065 AC3). Reuses the
// existing editor (SubstanceUseTestingModals) on a PRIVATE draft list:
// - the editor's intermediate save (Initial Entry appends a draft before the
//   Test Set opens) only ever reaches this draft — never the store;
// - the store gets exactly one complete record, from onSaveComplete on the
//   final Save, through createProgramSubstanceTest (store validation
//   included), owned by `programId` with bulkTestId empty;
// - Cancel at any step leaves nothing behind.
// Render with a fresh `key` per session.

export function SubstanceTestCreateDialog({
  constituentId,
  programId,
  onClose,
  returnFocusTo,
  fallbackFocusId,
}: {
  constituentId: number;
  /** Resolved by the approved ownership rules before this opens. */
  programId: number;
  onClose: () => void;
  returnFocusTo?: () => HTMLElement | null;
  fallbackFocusId?: string;
}) {
  const [draft, setDraft] = useState<ModalTest[]>([]);
  const [initialEntryOpen, setInitialEntryOpen] =
    useState(true);
  const [editingTestId, setEditingTestId] = useState<
    number | null
  >(null);
  // One record per session, even if Save fires twice.
  const created = useRef(false);

  const returnFocusLater = () =>
    setTimeout(() => {
      if (!anyDialogOpen())
        restoreFocus(returnFocusTo?.(), fallbackFocusId);
    }, 0);

  function handleSaveComplete(saved: ModalTest): boolean {
    if (created.current) return true;
    const patch = toStorePatch(saved);
    if (!patch) {
      toast.error(
        "Sample Date/Time is not a valid date and time. Check the Initial Entry.",
      );
      return false;
    }
    // toStorePatch returns every editable field; identity and ownership
    // come from this youth and the resolved Program.
    const result = createProgramSubstanceTest({
      ...(patch as Required<typeof patch>),
      constituentId,
      programId,
    });
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    created.current = true;
    return true;
  }

  return (
    <SubstanceUseTestingModals
      tests={draft}
      onUpdateTests={setDraft}
      initialEntryOpen={initialEntryOpen}
      onInitialEntryOpenChange={(open) => {
        setInitialEntryOpen(open);
        if (!open) returnFocusLater();
      }}
      editingTestId={editingTestId}
      onEditingTestIdChange={(id) => {
        setEditingTestId(id);
        if (id === null && editingTestId !== null) {
          onClose();
          returnFocusLater();
        }
      }}
      onSaveComplete={handleSaveComplete}
    />
  );
}