import { Navigate, useParams } from "react-router";
import { programMedReviewsUrl } from "../../lib/programMedReviews";

// Compatibility for the earlier /program/:id/med-reviews page: it now lands on
// Medications > Med Review Hub with the same Program context (replace, so no
// extra history entry). A malformed id is passed along as-is so Medications
// shows its own invalid-Program state rather than All Programs.
export function ProgramMedReviewsRedirect() {
  const { id = "" } = useParams();
  return <Navigate to={programMedReviewsUrl(id)} replace />;
}
