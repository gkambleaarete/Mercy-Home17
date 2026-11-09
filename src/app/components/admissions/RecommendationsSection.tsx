import { useState } from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function RecommendationsSection() {
  const [recommendations, setRecommendations] = useState({
    treatmentRecommendations: "",
    therapeuticServices: "",
    educationalSupports: "",
    medicalFollowUp: "",
    familyTherapy: "",
    groupTherapy: "",
    skillsTraining: "",
    behavioralInterventions: "",
    shortTermGoals: "",
    longTermGoals: "",
    dischargeplan: "",
    followUpCare: ""
  });

  return (
    <div className="space-y-6">
      <div 
        className="overflow-hidden"
        style={{
          border: '1px solid var(--slds-g-color-border-base-1)',
          borderRadius: 'var(--slds-c-card-radius-border)',
          backgroundColor: 'var(--slds-g-color-background-base)'
        }}
      >
        <div 
          className="px-4 py-3"
          style={{
            borderBottom: '1px solid var(--slds-g-color-border-base-1)',
            backgroundColor: 'var(--slds-g-color-background-alt)'
          }}
        >
          <h3 className="font-semibold text-[#080707]">Treatment Recommendations</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="treatment-rec" className="text-[11px] mb-1.5">Overall Treatment Recommendations</Label>
            <Textarea
              id="treatment-rec"
              className="text-[13px]"
              rows={4}
              value={recommendations.treatmentRecommendations}
              onChange={(e) => setRecommendations({...recommendations, treatmentRecommendations: e.target.value})}
              placeholder="Comprehensive treatment recommendations based on assessment..."
            />
          </div>
          <div>
            <Label htmlFor="therapeutic" className="text-[11px] mb-1.5">Therapeutic Services Needed</Label>
            <Textarea
              id="therapeutic"
              className="text-[13px]"
              rows={3}
              value={recommendations.therapeuticServices}
              onChange={(e) => setRecommendations({...recommendations, therapeuticServices: e.target.value})}
              placeholder="Individual therapy, group therapy, family therapy, etc..."
            />
          </div>
          <div>
            <Label htmlFor="educational" className="text-[11px] mb-1.5">Educational Supports</Label>
            <Textarea
              id="educational"
              className="text-[13px]"
              rows={3}
              value={recommendations.educationalSupports}
              onChange={(e) => setRecommendations({...recommendations, educationalSupports: e.target.value})}
              placeholder="IEP, tutoring, special education services..."
            />
          </div>
          <div>
            <Label htmlFor="medical" className="text-[11px] mb-1.5">Medical Follow-Up</Label>
            <Textarea
              id="medical"
              className="text-[13px]"
              rows={3}
              value={recommendations.medicalFollowUp}
              onChange={(e) => setRecommendations({...recommendations, medicalFollowUp: e.target.value})}
              placeholder="Recommended medical evaluations and follow-up care..."
            />
          </div>
          <div>
            <Label htmlFor="behavioral" className="text-[11px] mb-1.5">Behavioral Interventions</Label>
            <Textarea
              id="behavioral"
              className="text-[13px]"
              rows={3}
              value={recommendations.behavioralInterventions}
              onChange={(e) => setRecommendations({...recommendations, behavioralInterventions: e.target.value})}
              placeholder="Behavior modification strategies, DBT, CBT, etc..."
            />
          </div>
        </div>
      </div>

      <div 
        className="overflow-hidden"
        style={{
          border: '1px solid var(--slds-g-color-border-base-1)',
          borderRadius: 'var(--slds-c-card-radius-border)',
          backgroundColor: 'var(--slds-g-color-background-base)'
        }}
      >
        <div 
          className="px-4 py-3"
          style={{
            borderBottom: '1px solid var(--slds-g-color-border-base-1)',
            backgroundColor: 'var(--slds-g-color-background-alt)'
          }}
        >
          <h3 className="font-semibold text-[#080707]">Treatment Goals</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="short-goals" className="text-[11px] mb-1.5">Short-Term Goals (30-90 days)</Label>
            <Textarea
              id="short-goals"
              className="text-[13px]"
              rows={4}
              value={recommendations.shortTermGoals}
              onChange={(e) => setRecommendations({...recommendations, shortTermGoals: e.target.value})}
              placeholder="List immediate treatment goals..."
            />
          </div>
          <div>
            <Label htmlFor="long-goals" className="text-[11px] mb-1.5">Long-Term Goals (6-12 months)</Label>
            <Textarea
              id="long-goals"
              className="text-[13px]"
              rows={4}
              value={recommendations.longTermGoals}
              onChange={(e) => setRecommendations({...recommendations, longTermGoals: e.target.value})}
              placeholder="List long-term treatment objectives..."
            />
          </div>
        </div>
      </div>

      <div 
        className="overflow-hidden"
        style={{
          border: '1px solid var(--slds-g-color-border-base-1)',
          borderRadius: 'var(--slds-c-card-radius-border)',
          backgroundColor: 'var(--slds-g-color-background-base)'
        }}
      >
        <div 
          className="px-4 py-3"
          style={{
            borderBottom: '1px solid var(--slds-g-color-border-base-1)',
            backgroundColor: 'var(--slds-g-color-background-alt)'
          }}
        >
          <h3 className="font-semibold text-[#080707]">Discharge Planning & Follow-Up</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="discharge" className="text-[11px] mb-1.5">Discharge Plan</Label>
            <Textarea
              id="discharge"
              className="text-[13px]"
              rows={4}
              value={recommendations.dischargePlan}
              onChange={(e) => setRecommendations({...recommendations, dischargePlan: e.target.value})}
              placeholder="Plan for transition from current program..."
            />
          </div>
          <div>
            <Label htmlFor="followup" className="text-[11px] mb-1.5">Follow-Up Care Recommendations</Label>
            <Textarea
              id="followup"
              className="text-[13px]"
              rows={4}
              value={recommendations.followUpCare}
              onChange={(e) => setRecommendations({...recommendations, followUpCare: e.target.value})}
              placeholder="Ongoing support services, aftercare programs..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
