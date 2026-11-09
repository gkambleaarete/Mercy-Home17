import { useParams, useNavigate, useLocation } from "react-router";
import { ArrowLeft } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { FFMentorApplicationRecord } from "../ff-mentor/FFMentorApplicationRecord";
import { useFFMentorApplication } from "../../data/ffMentorApplicationStore";

/** Where a record was opened from; set by the list that links here. */
export interface FFMentorRecordOrigin {
  backLabel?: string;
}

const LIST_PATH = "/friends-first-applications";

export function FriendsFirstMentorRecordPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const origin = location.state as FFMentorRecordOrigin | null;

  // Every Friends First mentor record — submitted or seeded — is a Mentor
  // Application resolved by its own id from the shared store. Exact id only:
  // never matched by name, never another record.
  const lookup = useFFMentorApplication(id ?? "");

  // Back returns to the list the user came from (history entry, which keeps
  // that list's filters and page); a direct visit falls back to Applications.
  const goBack = () =>
    location.key !== "default"
      ? navigate(-1)
      : navigate(LIST_PATH);

  if (lookup.status === "found")
    return (
      <FFMentorApplicationRecord
        key={lookup.application.applicationId}
        application={lookup.application}
        staff={lookup.staff}
        onBack={goBack}
        backLabel={origin?.backLabel}
      />
    );

  const unavailable = lookup.status === "unavailable";
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <h2
          className="text-2xl font-semibold mb-4"
          style={{
            color: "var(--slds-g-color-text-default)",
          }}
        >
          {unavailable
            ? "Application Unavailable"
            : "Mentor Not Found"}
        </h2>
        <p
          className="mb-4"
          style={{ color: "var(--slds-g-color-text-weak)" }}
        >
          {unavailable
            ? "Saved application data could not be read. It has not been changed."
            : "The mentor you're looking for doesn't exist."}
        </p>
        <Button
          onClick={goBack}
          className="rounded-full"
          style={{
            backgroundColor: "#145F33",
            color: "#FFFFFF",
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
