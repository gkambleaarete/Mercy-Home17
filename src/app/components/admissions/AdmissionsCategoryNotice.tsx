import { Alert, AlertDescription } from "../ui/alert";
import type { AdmissionsCategoryUnreadableReason } from "../../data/admissionsCategoryStore";

/** Shown by every Admissions view that reads saved categories
 *  (useLeadsWithSavedCategories) when they can't be read. The categories
 *  on screen are then the original baseline values, not saved ones. */
export function AdmissionsCategoryNotice({
  error,
}: {
  error: AdmissionsCategoryUnreadableReason | null;
}) {
  if (!error) return null;
  return (
    <Alert variant="error" role="alert">
      <AlertDescription>
        {error === "corrupt"
          ? "Saved category changes can't be read. The categories shown are the original ones, not your saved changes, and Category can't be changed. The saved data has been left as it is."
          : "Saved category changes were made by a newer version of this app. The categories shown are the original ones, not your saved changes, and Category can't be changed. The saved data has been left as it is."}
      </AlertDescription>
    </Alert>
  );
}