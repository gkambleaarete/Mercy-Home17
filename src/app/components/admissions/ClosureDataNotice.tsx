import { Alert, AlertDescription } from "../ui/alert";
import { useAdmissionsStateProblem } from "../../data/admissionsStateStore";

// Shown by the Projections & Waitlist page and its Closing List when the
// saved Admissions data (which includes the closure state) can't be read.
// The closures on screen are then the original starting values, NOT saved
// state, and closure changes are refused until the data can be read. The
// unreadable data itself is never changed.
export function ClosureDataNotice({
  scope,
}: {
  /** What the surrounding view shows, so the wording fits it. */
  scope: "page" | "closing-list";
}) {
  const problem = useAdmissionsStateProblem();
  if (!problem) return null;
  const subject =
    scope === "closing-list"
      ? "The Closing List shown is the original one, not your saved closures"
      : "Closed and Closing List cases shown are the original ones, not your saved closures";
  const cause = problem.legacy
    ? "Closure and category data saved by an earlier version of this app can't be read, so it couldn't be brought forward."
    : problem.reason === "corrupt"
      ? "Saved closure data can't be read."
      : "Saved closure data was written by a newer version of this app.";
  return (
    <Alert variant="error" role="alert">
      <AlertDescription>
        {cause} {subject}, and closures can't be started, reopened
        or completed until it can be read. The saved data has been
        left as it is.
      </AlertDescription>
    </Alert>
  );
}