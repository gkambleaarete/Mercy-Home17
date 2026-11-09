import { useEffect } from "react";
import { usePassDialog } from "../../contexts/PassDialogContext";

// SUPERSEDED. Global Actions → New Pass now opens the shared Pass record
// modal (contexts/PassDialogContext → PassRecordDialog) directly from
// GlobalHeader, so nothing renders this component any more. It is kept only
// as a thin shim over that shared flow (no form, no save logic, no routing of
// its own) and can be deleted once the owner confirms.

export function GlobalNewPassDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { openCreate } = usePassDialog();
  useEffect(() => {
    if (!open) return;
    openCreate({ onClose: () => onOpenChange(false) });
    // Opens once per `open` transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return null;
}
