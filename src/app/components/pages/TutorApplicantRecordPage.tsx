import { useParams, useNavigate } from "react-router";
import { ArrowLeft } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { TutorApplicantRecord } from "../TutorApplicantRecord";
import { getTutorApplicantById } from "../../data/mockTutorApplicantData";

export function TutorApplicantRecordPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const applicant = id ? getTutorApplicantById(id) : undefined;

  if (!applicant) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2
            className="text-2xl font-semibold mb-4"
            style={{ color: "var(--slds-g-color-text-default)" }}
          >
            Applicant Not Found
          </h2>
          <p
            className="mb-4"
            style={{ color: "var(--slds-g-color-text-weak)" }}
          >
            The tutor applicant you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => navigate(-1)}
            className="rounded-full"
            style={{ backgroundColor: "#145F33", color: "#FFFFFF" }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TutorApplicantRecord applicant={applicant} onBack={() => navigate(-1)} />
  );
}
