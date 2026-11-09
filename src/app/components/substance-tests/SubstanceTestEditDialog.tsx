import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SubstanceUseTestingModals } from "../admissions/SubstanceUseTestingModals";
import {
  type ProgramSubstanceTest,
  type ProgramSubstanceTestPatch,
  updateProgramSubstanceTest,
} from "../../data/mockSubstanceTestData";
import {
  fromModalDateTime,
  toModalDateTime,
} from "./substanceTestDateTime";
import { anyDialogOpen, restoreFocus } from "./focusReturn";

// Program-level Edit (20065 AC12): reuses the existing Substance Test editor
// (SubstanceUseTestingModals) on an ISOLATED working copy of one test.
//
// - The modal's intermediate writes (it saves the Initial Entry before the
//   Test Set opens) only ever reach this working copy, never the store.
// - The store is written once, from onSaveComplete on the final Save, via
//   updateProgramSubstanceTest — which keeps id, constituentId, programId
//   and bulkTestId. Other youths' tests and bulk groups are never touched.
// - Cancel at any step discards the working copy.
//
// Render with a fresh `key` per Edit session so every session starts from
// the store's current record.

/** The modal's test shape (its interface is internal to that file). */
export type ModalTest = Omit<
  ProgramSubstanceTest,
  | "constituentId"
  | "programId"
  | "sampleDateTime"
  | "bulkTestId"
> & { dateTime: string };

/** Store record → modal working copy. Deep-copies nested tests so the
 *  editor can never mutate the store's objects. null when the stored Sample
 *  Date/Time is malformed. */
export function toModalTest(
  t: ProgramSubstanceTest,
): ModalTest | null {
  const dateTime = toModalDateTime(t.sampleDateTime);
  if (dateTime === null) return null;
  return {
    id: t.id,
    dateTime,
    reason: t.reason,
    newUse: t.newUse,
    testDetails: structuredClone(t.testDetails),
    suspectTampering: t.suspectTampering,
    tamperingComments: t.tamperingComments,
    labConsultation: t.labConsultation,
    action: t.action,
    refrigeratorDate: t.refrigeratorDate,
    pickupDate: t.pickupDate,
    discardDate: t.discardDate,
    discardReason: t.discardReason,
  };
}

/** Modal result → store patch. Only editable fields: identity, ownership
 *  and the bulk link are not part of a patch. null when the Sample
 *  Date/Time is not a real date and time. */
export function toStorePatch(
  m: ModalTest,
): ProgramSubstanceTestPatch | null {
  const sampleDateTime = fromModalDateTime(m.dateTime);
  if (sampleDateTime === null) return null;
  return {
    sampleDateTime,
    reason: m.reason,
    newUse: m.newUse,
    testDetails: structuredClone(m.testDetails),
    suspectTampering: m.suspectTampering,
    tamperingComments: m.tamperingComments,
    labConsultation: m.labConsultation,
    action: m.action,
    refrigeratorDate: m.refrigeratorDate,
    pickupDate: m.pickupDate,
    discardDate: m.discardDate,
    discardReason: m.discardReason,
  };
}

export function SubstanceTestEditDialog({
  test,
  onClose,
  returnFocusTo,
  fallbackFocusId,
}: {
  test: ProgramSubstanceTest;
  /** Called when the session ends: after a successful Save, or on Cancel
   *  from the Test Set. */
  onClose: () => void;
  /** The control that opened the dialog; focus returns to it on close. */
  returnFocusTo?: () => HTMLElement | null;
  /** Element id to focus if that control is gone or disabled. */
  fallbackFocusId?: string;
}) {
  // The editor's dialogs belong to SubstanceUseTestingModals (opened from
  // state), so focus is returned here once the session's dialogs are gone —
  // after Radix has finished closing, never leaving it on <body>.
  const returnFocusLater = () =>
    setTimeout(() => {
      if (!anyDialogOpen())
        restoreFocus(returnFocusTo?.(), fallbackFocusId);
    }, 0);
  const [draft, setDraft] = useState<ModalTest[]>(() => {
    const m = toModalTest(test);
    return m ? [m] : [];
  });
  const [initialEntryOpen, setInitialEntryOpen] = useState(
    draft.length > 0,
  );
  const [editingTestId, setEditingTestId] = useState<
    number | null
  >(draft.length > 0 ? test.id : null);

  // Malformed stored date: never open the editor on bad data.
  const unusable = draft.length === 0;
  useEffect(() => {
    if (!unusable) return;
    toast.error(
      "This Substance Test's Sample Date/Time is not valid and cannot be edited.",
    );
    onClose();
    // Runs once per session (the component is keyed per Edit).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (unusable) return null;

  function handleSaveComplete(saved: ModalTest): boolean {
    const patch = toStorePatch(saved);
    if (!patch) {
      toast.error(
        "Sample Date/Time is not a valid date and time. Check the Initial Entry.",
      );
      return false;
    }
    const result = updateProgramSubstanceTest(test.id, patch);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    return true;
  }

  return (
    <SubstanceUseTestingModals
      tests={draft}
      onUpdateTests={setDraft}
      initialEntryOpen={initialEntryOpen}
      onInitialEntryOpenChange={(open) => {
        setInitialEntryOpen(open);
        // Cancel / Escape on Initial Entry leaves no dialog open; advancing
        // to the Test Set does, so this only acts on a real close.
        if (!open) returnFocusLater();
      }}
      editingTestId={editingTestId}
      onEditingTestIdChange={(id) => {
        setEditingTestId(id);
        if (id === null) {
          onClose();
          returnFocusLater();
        }
      }}
      onSaveComplete={handleSaveComplete}
    />
  );
}