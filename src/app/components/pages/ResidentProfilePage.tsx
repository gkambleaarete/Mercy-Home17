import { useParams, useNavigate } from "react-router";
import { ArrowLeft } from "@/app/lib/lucide-icons";
import { Button } from "../ui/button";
import { ResidentProfile } from "../ResidentProfile";
import { getResidentById } from "../../data/mockResidentData";

export function ResidentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const resident = id ? getResidentById(id) : null;

  if (!resident) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--slds-g-color-text-default)' }}>
            Resident Not Found
          </h2>
          <p className="mb-4" style={{ color: 'var(--slds-g-color-text-weak)' }}>
            The resident profile you're looking for doesn't exist.
          </p>
          <Button
            onClick={() => navigate(-1)}
            className="rounded-full"
            style={{
              backgroundColor: '#145F33',
              color: '#FFFFFF'
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ResidentProfile 
      resident={resident} 
      onClose={() => navigate(-1)} 
    />
  );
}
