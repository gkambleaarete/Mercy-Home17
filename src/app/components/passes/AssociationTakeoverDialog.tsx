import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

// Confirms taking over a Pass ↔ Pack Med link that already belongs to
// another record (20042). It only confirms the selection — the actual
// reassignment is done by lib/passPackMedAssociation.ts when the record is
// saved, so no synchronization logic lives here.
export function AssociationTakeoverDialog({
  open,
  message,
  onCancel,
  onContinue,
}: {
  open: boolean;
  message: string;
  onCancel: () => void;
  onContinue: () => void;
}) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => !o && onCancel()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Replace existing link?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onContinue}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}