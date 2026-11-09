import { useState } from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

// Simulated user role check - in production, this would come from auth context
const hasHHICRole = true; // Set to false to test conditional visibility

interface FieldHistoryEntry {
  id: number;
  fieldName: string;
  originalValue: string;
  newValue: string;
  changedBy: string;
  timestamp: string;
}

export function FamilyHistorySection() {
  const [formData, setFormData] = useState({
    whoLivesWithYouth: "",
    householdIncome: "",
    householdSize: "",
    parentingMostChallenging: "",
    parentingMostRewarding: "",
    homeRules: "",
    effectiveDiscipline: "",
    problemSolvingInFamily: "",
    familyFunctioningTimeline: "",
    familyMentalHealthHistory: "",
    caregiverEmploymentHistory: "",
    caregiverSubstanceUseHistory: "",
    reportedDCFSInvolvementHistory: ""
  });

  // Mock field history data
  const [fieldHistory] = useState<FieldHistoryEntry[]>([
    {
      id: 1,
      fieldName: "Household Income",
      originalValue: "$35,000",
      newValue: "$42,000",
      changedBy: "Jane Smith",
      timestamp: "2026-02-15 10:30 AM"
    },
    {
      id: 2,
      fieldName: "Household Size",
      originalValue: "3",
      newValue: "4",
      changedBy: "Jane Smith",
      timestamp: "2026-02-15 10:31 AM"
    },
    {
      id: 3,
      fieldName: "Household Income",
      originalValue: "$42,000",
      newValue: "$45,500",
      changedBy: "Michael Johnson",
      timestamp: "2026-03-01 02:15 PM"
    }
  ]);

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Section 1: General */}
      <div>
        <h3 
          className="text-[14px] font-semibold mb-4 pb-2"
          style={{ 
            color: 'var(--slds-g-color-text-default)',
            borderBottom: '1px solid var(--slds-g-color-border-base-1)'
          }}
        >
          General
        </h3>
        <div>
          <Label 
            htmlFor="who-lives-with-youth" 
            className="block text-[12px] font-semibold mb-1.5 uppercase" 
            style={{ color: 'var(--slds-g-color-text-weak)' }}
          >
            Who lives with the youth?
          </Label>
          <Textarea
            id="who-lives-with-youth"
            className="text-[13px] rounded min-h-[100px]"
            style={{
              backgroundColor: 'var(--slds-g-color-background-base)',
              border: '1px solid var(--slds-g-color-border-base-1)',
              color: 'var(--slds-g-color-text-default)'
            }}
            value={formData.whoLivesWithYouth}
            onChange={(e) => updateField("whoLivesWithYouth", e.target.value)}
            placeholder="Describe who currently lives with the youth..."
          />
        </div>
      </div>

      {/* Section 2: Parenting Approach & Challenges */}
      <div>
        <h3 
          className="text-[14px] font-semibold mb-4 pb-2"
          style={{ 
            color: 'var(--slds-g-color-text-default)',
            borderBottom: '1px solid var(--slds-g-color-border-base-1)'
          }}
        >
          Parenting Approach & Challenges
        </h3>

        <div className="space-y-4">
          {/* What part of parenting is most challenging? */}
          <div>
            <Label 
              htmlFor="parenting-challenging" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              What part of parenting is most challenging?
            </Label>
            <Textarea
              id="parenting-challenging"
              className="text-[13px] rounded min-h-[100px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.parentingMostChallenging}
              onChange={(e) => updateField("parentingMostChallenging", e.target.value)}
              placeholder="Describe the most challenging aspects of parenting..."
            />
          </div>

          {/* What part of parenting is most rewarding? */}
          <div>
            <Label 
              htmlFor="parenting-rewarding" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              What part of parenting is most rewarding?
            </Label>
            <Textarea
              id="parenting-rewarding"
              className="text-[13px] rounded min-h-[100px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.parentingMostRewarding}
              onChange={(e) => updateField("parentingMostRewarding", e.target.value)}
              placeholder="Describe the most rewarding aspects of parenting..."
            />
          </div>

          {/* What are the rules in your home that the child/children are expected to follow? */}
          <div>
            <Label 
              htmlFor="home-rules" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              What are the rules in your home that the child/children are expected to follow?
            </Label>
            <Textarea
              id="home-rules"
              className="text-[13px] rounded min-h-[100px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.homeRules}
              onChange={(e) => updateField("homeRules", e.target.value)}
              placeholder="List the household rules and expectations..."
            />
          </div>

          {/* What have you found works effectively in disciplining your child? */}
          <div>
            <Label 
              htmlFor="effective-discipline" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              What have you found works effectively in disciplining your child?
            </Label>
            <Textarea
              id="effective-discipline"
              className="text-[13px] rounded min-h-[100px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.effectiveDiscipline}
              onChange={(e) => updateField("effectiveDiscipline", e.target.value)}
              placeholder="Describe effective discipline strategies..."
            />
          </div>

          {/* How are problems solved within your family? */}
          <div>
            <Label 
              htmlFor="problem-solving" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              How are problems solved within your family?
            </Label>
            <Textarea
              id="problem-solving"
              className="text-[13px] rounded min-h-[100px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.problemSolvingInFamily}
              onChange={(e) => updateField("problemSolvingInFamily", e.target.value)}
              placeholder="Describe how your family approaches and resolves problems..."
            />
          </div>
        </div>
      </div>

      {/* Section 4: Family History */}
      <div>
        <h3 
          className="text-[14px] font-semibold mb-4 pb-2"
          style={{ 
            color: 'var(--slds-g-color-text-default)',
            borderBottom: '1px solid var(--slds-g-color-border-base-1)'
          }}
        >
          Family History
        </h3>

        <div className="space-y-4">
          {/* Family Functioning & Timeline */}
          <div>
            <Label 
              htmlFor="family-functioning-timeline" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Family Functioning & Timeline:
            </Label>
            <Textarea
              id="family-functioning-timeline"
              className="text-[13px] rounded min-h-[120px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.familyFunctioningTimeline}
              onChange={(e) => updateField("familyFunctioningTimeline", e.target.value)}
              placeholder="Describe the family's functioning history and significant timeline events..."
            />
          </div>

          {/* Family Mental Health History */}
          <div>
            <Label 
              htmlFor="family-mental-health-history" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Family Mental Health History:
            </Label>
            <Textarea
              id="family-mental-health-history"
              className="text-[13px] rounded min-h-[120px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.familyMentalHealthHistory}
              onChange={(e) => updateField("familyMentalHealthHistory", e.target.value)}
              placeholder="Describe any mental health history within the family..."
            />
          </div>

          {/* Caregiver Employment History */}
          <div>
            <Label 
              htmlFor="caregiver-employment-history" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Caregiver Employment History
            </Label>
            <Textarea
              id="caregiver-employment-history"
              className="text-[13px] rounded min-h-[120px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.caregiverEmploymentHistory}
              onChange={(e) => updateField("caregiverEmploymentHistory", e.target.value)}
              placeholder="Describe the caregiver's employment history..."
            />
          </div>

          {/* Caregiver Substance Use History */}
          <div>
            <Label 
              htmlFor="caregiver-substance-use-history" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Caregiver Substance Use History
            </Label>
            <Textarea
              id="caregiver-substance-use-history"
              className="text-[13px] rounded min-h-[120px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.caregiverSubstanceUseHistory}
              onChange={(e) => updateField("caregiverSubstanceUseHistory", e.target.value)}
              placeholder="Describe any substance use history of the caregiver(s)..."
            />
          </div>

          {/* Reported DCFS Involvement History */}
          <div>
            <Label 
              htmlFor="reported-dcfs-involvement-history" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Reported DCFS Involvement History
            </Label>
            <Textarea
              id="reported-dcfs-involvement-history"
              className="text-[13px] rounded min-h-[120px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.reportedDCFSInvolvementHistory}
              onChange={(e) => updateField("reportedDCFSInvolvementHistory", e.target.value)}
              placeholder="Describe any reported DCFS involvement history..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}