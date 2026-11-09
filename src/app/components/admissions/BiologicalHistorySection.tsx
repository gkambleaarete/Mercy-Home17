import { useState, useMemo } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Plus, X as XIcon, Save } from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

interface MilestoneData {
  benchmarks: string[]; // Multi-select: Talking, Walking, Potty Trained
  talkingAge: string;
  walkingAge: string;
  pottyTrainedAge: string;
}

interface AdoptionData {
  wasAdopted: string;
  knowsAdopted: string;
  ageWhenAdopted: string;
  surroundingCircumstances: string;
  comments: string;
}

interface AdoptedByRelationship {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  address: string;
}

interface RelationshipFormData {
  relatedTo?: string;
  relationship?: string;
  startDate?: string;
  endDate?: string;
  involvementLevel?: string;
  relationshipQuality?: string;
  comments?: string;
  legalGuardian?: boolean;
  eligibleForPass?: boolean;
  isAdoptiveParent?: boolean;
  emergencyContact?: boolean;
}

// Mock relationships data (would come from actual relationships in real implementation)
const mockRelationships = [
  { id: "rel1", name: "John Smith", relationship: "Adoptive Father", phone: "(312) 555-0123", address: "123 Main St, Chicago, IL", isAdoptiveParent: true },
  { id: "rel2", name: "Jane Smith", relationship: "Adoptive Mother", phone: "(312) 555-0124", address: "123 Main St, Chicago, IL", isAdoptiveParent: true },
  { id: "rel3", name: "Robert Johnson", relationship: "Uncle", phone: "(773) 555-0198", address: "456 Oak Ave, Chicago, IL", isAdoptiveParent: false },
];

// Relationship types matching Add Relationship dialog
const RELATIONSHIP_TYPES = [
  "Admissions Clinician",
  "Adoptive Brother",
  "Adoptive Daughter",
  "Adoptive Father",
  "Adoptive Granddaughter",
  "Adoptive Grandfather",
  "Adoptive Grandmother",
  "Adoptive Grandson",
  "Adoptive Mother",
  "Adoptive Sister",
  "Adoptive Son",
  "Advisee",
  "Advisor",
  "Aunt",
  "Brother",
  "Case Worker",
  "Cousin",
  "Father",
  "Foster Parent",
  "Grandfather",
  "Grandmother",
  "Grandparent",
  "Guardian",
  "Mother",
  "Other",
  "Sibling",
  "Sister",
  "Uncle",
];

// Mock data for Related Constituent dropdown
const mockRelatedConstituents = [
  { id: "1135", name: "Maria Rodriguez" },
  { id: "1138", name: "James Thompson" },
  { id: "1141", name: "Sarah Johnson" },
  { id: "1144", name: "Michael Chen" },
  { id: "1145", name: "Emily Davis" },
  { id: "1146", name: "Robert Martinez" },
  { id: "1147", name: "Jennifer Wilson" },
  { id: "1150", name: "David Anderson" },
  { id: "1154", name: "Lisa Brown" },
  { id: "1155", name: "Christopher Lee" },
];

// Mock constituent details for pre-filling data
const mockConstituentDetails: Record<string, { name: string; phone: string; address: string }> = {
  "1135": { name: "Maria Rodriguez", phone: "(312) 555-0142", address: "1234 W Madison St, Chicago, IL 60607" },
  "1138": { name: "James Thompson", phone: "(773) 555-0198", address: "567 N Clark St, Chicago, IL 60654" },
  "1141": { name: "Sarah Johnson", phone: "(312) 555-0234", address: "789 S State St, Chicago, IL 60605" },
  "1144": { name: "Michael Chen", phone: "(773) 555-0267", address: "321 W Division St, Chicago, IL 60610" },
  "1145": { name: "Emily Davis", phone: "(312) 555-0331", address: "456 N Michigan Ave, Chicago, IL 60611" },
  "1146": { name: "Robert Martinez", phone: "(773) 555-0415", address: "890 W Chicago Ave, Chicago, IL 60642" },
  "1147": { name: "Jennifer Wilson", phone: "(312) 555-0489", address: "234 S Wabash Ave, Chicago, IL 60604" },
  "1150": { name: "David Anderson", phone: "(773) 555-0563", address: "678 N Halsted St, Chicago, IL 60642" },
  "1154": { name: "Lisa Brown", phone: "(312) 555-0637", address: "901 W Lake St, Chicago, IL 60607" },
  "1155": { name: "Christopher Lee", phone: "(773) 555-0711", address: "345 N LaSalle Dr, Chicago, IL 60654" },
};

export function BiologicalHistorySection() {
  const initialFormData = {
    relationshipStatusConception: "",
    relationshipStatusAssessment: "",
    maternalStressLevel: "",
    maternalStressOther: "",
    pregnancyDeliveryDetails: [] as string[],
    birthComments: ""
  };

  const initialAdoptionData: AdoptionData = {
    wasAdopted: "",
    knowsAdopted: "",
    ageWhenAdopted: "",
    surroundingCircumstances: "",
    comments: ""
  };

  const initialMilestones: MilestoneData = {
    benchmarks: [],
    talkingAge: "",
    walkingAge: "",
    pottyTrainedAge: ""
  };

  const [formData, setFormData] = useState(initialFormData);
  const [adoptionData, setAdoptionData] = useState<AdoptionData>(initialAdoptionData);
  const [milestones, setMilestones] = useState<MilestoneData>(initialMilestones);
  const [adoptedByRelationships, setAdoptedByRelationships] = useState<AdoptedByRelationship[]>([]);
  
  // Track saved state for comparison
  const [savedFormData, setSavedFormData] = useState(initialFormData);
  const [savedAdoptionData, setSavedAdoptionData] = useState<AdoptionData>(initialAdoptionData);
  const [savedMilestones, setSavedMilestones] = useState<MilestoneData>(initialMilestones);
  const [savedAdoptedByRelationships, setSavedAdoptedByRelationships] = useState<AdoptedByRelationship[]>([]);
  
  // Dialog states for Adopted By
  const [isSelectAdoptedByDialogOpen, setIsSelectAdoptedByDialogOpen] = useState(false);
  const [selectedAdoptedById, setSelectedAdoptedById] = useState("");
  const [isDeleteAdoptedByConfirmOpen, setIsDeleteAdoptedByConfirmOpen] = useState(false);
  const [deletingAdoptedById, setDeletingAdoptedById] = useState<string | null>(null);
  
  // Add Relationship Dialog state
  const [isAddRelationshipDialogOpen, setIsAddRelationshipDialogOpen] = useState(false);
  const [relationshipFormData, setRelationshipFormData] = useState<RelationshipFormData>({});
  
  // Check if form has unsaved changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(savedFormData) ||
                     JSON.stringify(adoptionData) !== JSON.stringify(savedAdoptionData) ||
                     JSON.stringify(milestones) !== JSON.stringify(savedMilestones) ||
                     JSON.stringify(adoptedByRelationships) !== JSON.stringify(savedAdoptedByRelationships);

  // Compute available relationships for Adopted By (those with isAdoptiveParent flag and not already added)
  const availableAdoptedByRelationships = useMemo(() => {
    return mockRelationships
      .filter(rel => rel.isAdoptiveParent && !adoptedByRelationships.find(ab => ab.id === rel.id))
      .map(rel => ({
        id: rel.id,
        name: rel.name,
        relationship: rel.relationship,
        phone: rel.phone,
        address: rel.address
      }));
  }, [adoptedByRelationships]);

  const updateField = (field: string, value: string | boolean | string[]) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateAdoptionField = (field: keyof AdoptionData, value: string) => {
    setAdoptionData({ ...adoptionData, [field]: value });
  };

  const updateMilestoneField = (field: keyof MilestoneData, value: string | string[]) => {
    setMilestones({ ...milestones, [field]: value });
  };

  const handleAddAdoptedBy = () => {
    setSelectedAdoptedById("");
    setIsSelectAdoptedByDialogOpen(true);
  };

  const handleSelectAdoptedBy = () => {
    if (!selectedAdoptedById) return;

    const selectedRel = mockRelationships.find(r => r.id === selectedAdoptedById);
    if (selectedRel) {
      setAdoptedByRelationships([
        ...adoptedByRelationships,
        {
          id: selectedRel.id,
          name: selectedRel.name,
          relationship: selectedRel.relationship,
          phone: selectedRel.phone,
          address: selectedRel.address
        }
      ]);
    }

    setIsSelectAdoptedByDialogOpen(false);
    setSelectedAdoptedById("");
  };

  const handleRemoveAdoptedBy = (id: string) => {
    setDeletingAdoptedById(id);
    setIsDeleteAdoptedByConfirmOpen(true);
  };

  const handleConfirmDeleteAdoptedBy = () => {
    if (deletingAdoptedById) {
      setAdoptedByRelationships(adoptedByRelationships.filter(ab => ab.id !== deletingAdoptedById));
    }
    setIsDeleteAdoptedByConfirmOpen(false);
    setDeletingAdoptedById(null);
  };

  const handleCreateNewAdoptedByRelationship = () => {
    // Close selection dialog and would open Add Relationship dialog
    // In real implementation, this would open the full relationship dialog with isAdoptiveParent pre-checked
    setIsSelectAdoptedByDialogOpen(false);
    setIsAddRelationshipDialogOpen(true);
    setRelationshipFormData({ isAdoptiveParent: true });
  };

  const handleSaveNewRelationship = () => {
    // Validate required fields
    if (!relationshipFormData.relatedTo || !relationshipFormData.relationship) {
      return;
    }

    // Get constituent details
    const constituent = mockConstituentDetails[relationshipFormData.relatedTo];
    if (!constituent) return;

    // Generate new ID
    const newId = `rel-new-${Date.now()}`;

    // Create new relationship and add to adoptedByRelationships
    const newAdoptedBy: AdoptedByRelationship = {
      id: newId,
      name: constituent.name,
      relationship: relationshipFormData.relationship,
      phone: constituent.phone,
      address: constituent.address
    };

    setAdoptedByRelationships([...adoptedByRelationships, newAdoptedBy]);

    // Close dialog and reset form
    setIsAddRelationshipDialogOpen(false);
    setRelationshipFormData({});
  };

  const togglePregnancyDetail = (value: string) => {
    const current = formData.pregnancyDeliveryDetails;
    if (current.includes(value)) {
      updateField("pregnancyDeliveryDetails", current.filter(v => v !== value));
    } else {
      updateField("pregnancyDeliveryDetails", [...current, value]);
    }
  };

  const handleSave = () => {
    // Save current state
    setSavedFormData(formData);
    setSavedAdoptionData(adoptionData);
    setSavedMilestones(milestones);
    setSavedAdoptedByRelationships(adoptedByRelationships);
    // Here you would normally save to backend/database
  };

  const handleCancel = () => {
    // Revert to saved state
    setFormData(savedFormData);
    setAdoptionData(savedAdoptionData);
    setMilestones(savedMilestones);
    setAdoptedByRelationships(savedAdoptedByRelationships);
  };

  return (
    <div className="space-y-6">
      {/* Biological Parent Relationship Status */}
      <div>
        <h3 
          className="text-[13px] font-semibold mb-4 pb-2"
          style={{ 
            color: 'var(--slds-g-color-text-default)',
            borderBottom: '1px solid var(--slds-g-color-border-base-1)'
          }}
        >
          Biological Parent Relationship Status
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label 
              htmlFor="relationship-conception" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Relationship Status at time of conception
            </Label>
            <Select value={formData.relationshipStatusConception} onValueChange={(value) => updateField("relationshipStatusConception", value)}>
              <SelectTrigger 
                id="relationship-conception"
                className="h-9 text-[13px] rounded"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
              >
                <SelectValue placeholder="--None--" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="legally-separated">Legally Separated</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="unmarried-partners">Unmarried Partners</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label 
              htmlFor="relationship-assessment" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Relationship Status at time of assessment
            </Label>
            <Select value={formData.relationshipStatusAssessment} onValueChange={(value) => updateField("relationshipStatusAssessment", value)}>
              <SelectTrigger 
                id="relationship-assessment"
                className="h-9 text-[13px] rounded"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
              >
                <SelectValue placeholder="--None--" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="legally-separated">Legally Separated</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="unmarried-partners">Unmarried Partners</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Birth Information */}
      <div>
        <h3 
          className="text-[13px] font-semibold mb-4 pb-2"
          style={{ 
            color: 'var(--slds-g-color-text-default)',
            borderBottom: '1px solid var(--slds-g-color-border-base-1)'
          }}
        >
          Birth Information
        </h3>
        <div className="space-y-4">
          {/* Maternal Stress Level */}
          <div>
            <Label 
              htmlFor="maternal-stress" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Maternal stress level during pregnancy
            </Label>
            <Select value={formData.maternalStressLevel} onValueChange={(value) => updateField("maternalStressLevel", value)}>
              <SelectTrigger 
                id="maternal-stress"
                className="h-9 text-[13px] rounded"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
              >
                <SelectValue placeholder="--None--" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="very-high">Very High</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Maternal Stress (Other) - Conditional */}
          {formData.maternalStressLevel === "other" && (
            <div>
              <Label 
                htmlFor="maternal-stress-other" 
                className="block text-[12px] font-semibold mb-1.5 uppercase" 
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                Maternal Stress (Other)
              </Label>
              <Input
                id="maternal-stress-other"
                type="text"
                className="h-9 text-[13px] rounded"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
                value={formData.maternalStressOther}
                onChange={(e) => updateField("maternalStressOther", e.target.value)}
                placeholder="Please specify..."
              />
            </div>
          )}

          {/* Pregnancy and Delivery Details - Multi-Select */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Pregnancy and Delivery Details
            </Label>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pregnancy-no-complications"
                  checked={formData.pregnancyDeliveryDetails.includes("no-complications")}
                  onCheckedChange={() => togglePregnancyDetail("no-complications")}
                />
                <Label 
                  htmlFor="pregnancy-no-complications" 
                  className="text-[13px] font-normal cursor-pointer"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                >
                  No Complications
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pregnancy-complications"
                  checked={formData.pregnancyDeliveryDetails.includes("complications")}
                  onCheckedChange={() => togglePregnancyDetail("complications")}
                />
                <Label 
                  htmlFor="pregnancy-complications" 
                  className="text-[13px] font-normal cursor-pointer"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                >
                  Complications
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pregnancy-substance-abuse"
                  checked={formData.pregnancyDeliveryDetails.includes("substance-abuse")}
                  onCheckedChange={() => togglePregnancyDetail("substance-abuse")}
                />
                <Label 
                  htmlFor="pregnancy-substance-abuse" 
                  className="text-[13px] font-normal cursor-pointer"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                >
                  Maternal Substance Abuse
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pregnancy-premature"
                  checked={formData.pregnancyDeliveryDetails.includes("premature")}
                  onCheckedChange={() => togglePregnancyDetail("premature")}
                />
                <Label 
                  htmlFor="pregnancy-premature" 
                  className="text-[13px] font-normal cursor-pointer"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                >
                  Premature Birth
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pregnancy-low-birth-weight"
                  checked={formData.pregnancyDeliveryDetails.includes("low-birth-weight")}
                  onCheckedChange={() => togglePregnancyDetail("low-birth-weight")}
                />
                <Label 
                  htmlFor="pregnancy-low-birth-weight" 
                  className="text-[13px] font-normal cursor-pointer"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                >
                  Low Birth Weight
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pregnancy-c-section"
                  checked={formData.pregnancyDeliveryDetails.includes("c-section")}
                  onCheckedChange={() => togglePregnancyDetail("c-section")}
                />
                <Label 
                  htmlFor="pregnancy-c-section" 
                  className="text-[13px] font-normal cursor-pointer"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                >
                  C-Section
                </Label>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div>
            <Label 
              htmlFor="birth-comments" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Comments
            </Label>
            <Textarea
              id="birth-comments"
              className="text-[13px] rounded min-h-[100px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.birthComments}
              onChange={(e) => updateField("birthComments", e.target.value)}
              placeholder="Enter comments about birth information..."
            />
          </div>
        </div>
      </div>

      {/* Adoption Information */}
      <div>
        <h3 
          className="text-[13px] font-semibold mb-4 pb-2"
          style={{ 
            color: 'var(--slds-g-color-text-default)',
            borderBottom: '1px solid var(--slds-g-color-border-base-1)'
          }}
        >
          Adoption Information
        </h3>
        
        <div className="space-y-4">
          {/* Was the youth adopted? */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Was the youth adopted?
            </Label>
            <Select value={adoptionData.wasAdopted} onValueChange={(value) => updateAdoptionField("wasAdopted", value)}>
              <SelectTrigger 
                className="h-9 text-[13px] rounded max-w-xs"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
              >
                <SelectValue placeholder="--None--" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Fields - Only show when "Yes" is selected */}
          {adoptionData.wasAdopted === "yes" && (
            <div 
              className="space-y-4 p-4 rounded"
              style={{
                backgroundColor: 'var(--slds-g-color-background-alt)',
                border: '1px solid var(--slds-g-color-border-base-1)'
              }}
            >
              {/* Does the youth know they are adopted? */}
              <div>
                <Label 
                  className="block text-[12px] font-semibold mb-1.5 uppercase" 
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Does the youth know they are adopted?
                </Label>
                <Select value={adoptionData.knowsAdopted} onValueChange={(value) => updateAdoptionField("knowsAdopted", value)}>
                  <SelectTrigger 
                    className="h-9 text-[13px] rounded max-w-xs"
                    style={{
                      backgroundColor: 'var(--slds-g-color-background-base)',
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      color: 'var(--slds-g-color-text-default)'
                    }}
                  >
                    <SelectValue placeholder="--None--" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Age when adopted */}
              <div>
                <Label 
                  htmlFor="age-when-adopted" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase" 
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Age when adopted
                </Label>
                <Input
                  id="age-when-adopted"
                  type="number"
                  min="0"
                  max="99"
                  className="h-9 text-[13px] rounded max-w-xs"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={adoptionData.ageWhenAdopted}
                  onChange={(e) => updateAdoptionField("ageWhenAdopted", e.target.value)}
                  placeholder="0-99"
                />
              </div>

              {/* Surrounding Circumstances */}
              <div>
                <Label 
                  htmlFor="surrounding-circumstances" 
                  className="block text-[12px] font-semibold mb-1.5 uppercase" 
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Surrounding Circumstances
                </Label>
                <Textarea
                  id="surrounding-circumstances"
                  className="text-[13px] rounded min-h-[100px]"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={adoptionData.surroundingCircumstances}
                  onChange={(e) => updateAdoptionField("surroundingCircumstances", e.target.value)}
                  placeholder="Describe the circumstances surrounding the adoption..."
                />
              </div>

              {/* Adopted By (Relationship Lookup) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label 
                    className="block text-[12px] font-semibold uppercase" 
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                  >
                    Adopted By
                  </Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    type="button"
                    className="h-8 rounded-full text-[12px]"
                    onClick={handleAddAdoptedBy}
                    style={{
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      backgroundColor: 'var(--slds-g-color-background-base)'
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>

                {adoptedByRelationships.length > 0 ? (
                  <div 
                    className="rounded overflow-hidden"
                    style={{
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      backgroundColor: 'var(--slds-g-color-background-base)'
                    }}
                  >
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr style={{ backgroundColor: 'var(--slds-g-color-background-alt)' }}>
                          <th className="px-4 py-2 text-left text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                            NAME
                          </th>
                          <th className="px-4 py-2 text-left text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                            RELATIONSHIP
                          </th>
                          <th className="px-4 py-2 text-left text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                            PHONE
                          </th>
                          <th className="px-4 py-2 text-left text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                            ADDRESS
                          </th>
                          <th className="px-4 py-2 text-right text-[11px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)', borderBottom: '1px solid var(--slds-g-color-border-base-1)' }}>
                            ACTIONS
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {adoptedByRelationships.map((rel) => (
                          <tr key={rel.id} className="border-b border-[#e5e5e4] hover:bg-[#fafaf9]">
                            <td className="px-4 py-2 text-[#080707] font-medium text-[12px]">
                              <a 
                                href="#" 
                                className="text-[#0176d3] hover:text-[#014486] hover:underline"
                                onClick={(e) => {
                                  e.preventDefault();
                                  console.log("Navigate to person record:", rel.name);
                                }}
                              >
                                {rel.name}
                              </a>
                            </td>
                            <td className="px-4 py-2 text-[#3e3e3c] text-[12px]">{rel.relationship}</td>
                            <td className="px-4 py-2 text-[#3e3e3c] text-[12px]">{rel.phone}</td>
                            <td className="px-4 py-2 text-[#3e3e3c] text-[12px]">{rel.address}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAdoptedBy(rel.id)}
                                  className="p-1 hover:bg-[#fef7f6] rounded transition-colors"
                                  title="Remove"
                                >
                                  <XIcon className="h-3.5 w-3.5 text-[#c23934]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div 
                    className="p-4 rounded text-center"
                    style={{
                      backgroundColor: 'var(--slds-g-color-background-base)',
                      border: '1px dashed var(--slds-g-color-border-base-1)',
                      color: 'var(--slds-g-color-text-weak)'
                    }}
                  >
                    <p className="text-[13px]">
                      No adoptive parents added. Click "Add" to select from existing relationships.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comments — Adoption Information's own field, separate from the
              Pregnancy and Delivery Details Comments above (US 19983) */}
          <div>
            <Label
              htmlFor="adoption-comments"
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Comments
            </Label>
            <Textarea
              id="adoption-comments"
              className="text-[13px] rounded min-h-[100px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={adoptionData.comments}
              onChange={(e) => updateAdoptionField("comments", e.target.value)}
              placeholder="Enter comments about adoption information..."
            />
          </div>
        </div>
      </div>

      {/* Developmental Milestones */}
      <div>
        <h3 
          className="text-[13px] font-semibold mb-4 pb-2"
          style={{ 
            color: 'var(--slds-g-color-text-default)',
            borderBottom: '1px solid var(--slds-g-color-border-base-1)'
          }}
        >
          Developmental Milestones
        </h3>
        
        <div className="space-y-4">
          {/* Benchmark - Multi-Select */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Benchmark
            </Label>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="milestone-talking"
                  checked={milestones.benchmarks.includes("Talking")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateMilestoneField("benchmarks", [...milestones.benchmarks, "Talking"]);
                    } else {
                      updateMilestoneField("benchmarks", milestones.benchmarks.filter(b => b !== "Talking"));
                    }
                  }}
                />
                <Label 
                  htmlFor="milestone-talking" 
                  className="text-[13px] font-normal cursor-pointer"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                >
                  Talking
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="milestone-walking"
                  checked={milestones.benchmarks.includes("Walking")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateMilestoneField("benchmarks", [...milestones.benchmarks, "Walking"]);
                    } else {
                      updateMilestoneField("benchmarks", milestones.benchmarks.filter(b => b !== "Walking"));
                    }
                  }}
                />
                <Label 
                  htmlFor="milestone-walking" 
                  className="text-[13px] font-normal cursor-pointer"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                >
                  Walking
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="milestone-potty-trained"
                  checked={milestones.benchmarks.includes("Potty Trained")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateMilestoneField("benchmarks", [...milestones.benchmarks, "Potty Trained"]);
                    } else {
                      updateMilestoneField("benchmarks", milestones.benchmarks.filter(b => b !== "Potty Trained"));
                    }
                  }}
                />
                <Label 
                  htmlFor="milestone-potty-trained" 
                  className="text-[13px] font-normal cursor-pointer"
                  style={{ color: 'var(--slds-g-color-text-default)' }}
                >
                  Potty Trained
                </Label>
              </div>
            </div>
          </div>

          {/* Age fields - show based on selected benchmarks */}
          {milestones.benchmarks.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {milestones.benchmarks.includes("Talking") && (
                <div>
                  <Label 
                    htmlFor="talking-age" 
                    className="block text-[12px] font-semibold mb-1.5 uppercase" 
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                  >
                    Talking Age (Months)
                  </Label>
                  <Input
                    id="talking-age"
                    type="number"
                    min="0"
                    max="999"
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor: 'var(--slds-g-color-background-base)',
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      color: 'var(--slds-g-color-text-default)'
                    }}
                    value={milestones.talkingAge}
                    onChange={(e) => updateMilestoneField("talkingAge", e.target.value)}
                    placeholder="Enter age in months"
                  />
                </div>
              )}

              {milestones.benchmarks.includes("Walking") && (
                <div>
                  <Label 
                    htmlFor="walking-age" 
                    className="block text-[12px] font-semibold mb-1.5 uppercase" 
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                  >
                    Walking Age (Months)
                  </Label>
                  <Input
                    id="walking-age"
                    type="number"
                    min="0"
                    max="999"
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor: 'var(--slds-g-color-background-base)',
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      color: 'var(--slds-g-color-text-default)'
                    }}
                    value={milestones.walkingAge}
                    onChange={(e) => updateMilestoneField("walkingAge", e.target.value)}
                    placeholder="Enter age in months"
                  />
                </div>
              )}

              {milestones.benchmarks.includes("Potty Trained") && (
                <div>
                  <Label 
                    htmlFor="potty-trained-age" 
                    className="block text-[12px] font-semibold mb-1.5 uppercase" 
                    style={{ color: 'var(--slds-g-color-text-weak)' }}
                  >
                    Potty Trained Age (Months)
                  </Label>
                  <Input
                    id="potty-trained-age"
                    type="number"
                    min="0"
                    max="999"
                    className="h-9 text-[13px] rounded"
                    style={{
                      backgroundColor: 'var(--slds-g-color-background-base)',
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      color: 'var(--slds-g-color-text-default)'
                    }}
                    value={milestones.pottyTrainedAge}
                    onChange={(e) => updateMilestoneField("pottyTrainedAge", e.target.value)}
                    placeholder="Enter age in months"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save/Cancel Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          onClick={handleCancel}
          variant="outline"
          className="h-9 px-4 text-[13px]"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="h-9 px-4 text-[13px]"
          style={{
            backgroundColor: '#145F33',
            color: 'white'
          }}
        >
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
      </div>

      {/* Select Adopted By Relationship Dialog */}
      <Dialog open={isSelectAdoptedByDialogOpen} onOpenChange={setIsSelectAdoptedByDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">Add Adopted By</DialogTitle>
            <DialogDescription className="text-[13px] text-[#3e3e3c]">
              Select an existing relationship to add as an adoptive parent.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {availableAdoptedByRelationships.length > 0 ? (
              <>
                <Label htmlFor="select-adopted-by" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  Select Relationship <span className="text-red-600">*</span>
                </Label>
                <Select value={selectedAdoptedById} onValueChange={setSelectedAdoptedById}>
                  <SelectTrigger 
                    id="select-adopted-by"
                    className="text-[13px] rounded"
                    style={{
                      backgroundColor: 'var(--slds-g-color-background-base)',
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      color: 'var(--slds-g-color-text-default)'
                    }}
                  >
                    <SelectValue placeholder="--Select a relationship--" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAdoptedByRelationships.map((rel) => (
                      <SelectItem key={rel.id} value={rel.id} className="text-[13px]">
                        <div className="flex flex-col">
                          <span className="font-medium">{rel.name}</span>
                          <span className="text-[11px] text-[#706e6b]">{rel.relationship}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-4 pt-4 border-t border-[#e5e5e4]">
                  <p className="text-[12px] text-[#706e6b] mb-2">Don't see the person you're looking for?</p>
                  <Button
                    variant="outline"
                    onClick={handleCreateNewAdoptedByRelationship}
                    className="rounded-full text-[13px]"
                    style={{
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      backgroundColor: 'var(--slds-g-color-background-base)'
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Create New Relationship
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-6 text-center">
                <p className="text-[13px] text-[#706e6b] mb-4">
                  All existing relationships with adoptive parent flag are already added.
                </p>
                <Button
                  onClick={handleCreateNewAdoptedByRelationship}
                  className="rounded-full text-[13px]"
                  style={{ backgroundColor: '#145F33' }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Create New Relationship
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSelectAdoptedByDialogOpen(false);
                setSelectedAdoptedById("");
              }}
              className="rounded-full text-[13px]"
            >
              Cancel
            </Button>
            {availableAdoptedByRelationships.length > 0 && (
              <Button
                onClick={handleSelectAdoptedBy}
                disabled={!selectedAdoptedById}
                className="rounded-full text-[13px]"
                style={{ backgroundColor: '#145F33' }}
              >
                Add
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Adopted By Confirmation Dialog */}
      <Dialog open={isDeleteAdoptedByConfirmOpen} onOpenChange={setIsDeleteAdoptedByConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-semibold">Remove Adoptive Parent?</DialogTitle>
            <DialogDescription className="text-[13px] text-[#3e3e3c]">
              Are you sure you want to remove this adoptive parent? This will not delete the relationship, only remove the adoptive parent designation.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteAdoptedByConfirmOpen(false);
                setDeletingAdoptedById(null);
              }}
              className="rounded-full text-[13px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDeleteAdoptedBy}
              className="rounded-full text-[13px] text-white hover:bg-[#c23934]/90"
              style={{ backgroundColor: '#c23934' }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Relationship Dialog */}
      <Dialog open={isAddRelationshipDialogOpen} onOpenChange={setIsAddRelationshipDialogOpen}>
        <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-[1500px] max-h-[95vh] overflow-y-auto p-6" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add Relationship</DialogTitle>
            <DialogDescription>
              Enter the relationship details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="relatedTo" className="text-[13px]">
                Related to <span className="text-red-600">*</span>
              </Label>
              <Select
                value={relationshipFormData.relatedTo || ""}
                onValueChange={(value) => setRelationshipFormData({ ...relationshipFormData, relatedTo: value })}
              >
                <SelectTrigger className="text-[13px]">
                  <SelectValue placeholder="Select constituent" />
                </SelectTrigger>
                <SelectContent>
                  {mockRelatedConstituents.map((constituent) => (
                    <SelectItem key={constituent.id} value={constituent.id} className="text-[13px]">
                      {constituent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="relationship" className="text-[13px]">
                Relationship <span className="text-red-600">*</span>
              </Label>
              <Select
                value={relationshipFormData.relationship || ""}
                onValueChange={(value) => setRelationshipFormData({ ...relationshipFormData, relationship: value })}
              >
                <SelectTrigger className="text-[13px]">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="text-[13px]">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate" className="text-[13px]">Start Date</Label>
                <DateInput
                  id="startDate"
value={isoToMdy(relationshipFormData.startDate || "")}
                  onChange={(v) => ((e) => setRelationshipFormData({ ...relationshipFormData, startDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                  className="text-[13px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate" className="text-[13px]">End Date</Label>
                <DateInput
                  id="endDate"
value={isoToMdy(relationshipFormData.endDate || "")}
                  onChange={(v) => ((e) => setRelationshipFormData({ ...relationshipFormData, endDate: e.target.value }))({ target: { value: mdyToIso(v) } })}
                  className="text-[13px]"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="involvementLevel" className="text-[13px]">
                How involved is the constituent with Alex Doe?
              </Label>
              <Select
                value={relationshipFormData.involvementLevel || ""}
                onValueChange={(value) => setRelationshipFormData({ ...relationshipFormData, involvementLevel: value })}
              >
                <SelectTrigger className="text-[13px]">
                  <SelectValue placeholder="Select involvement level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Minimal" className="text-[13px]">Minimal</SelectItem>
                  <SelectItem value="Moderate" className="text-[13px]">Moderate</SelectItem>
                  <SelectItem value="None" className="text-[13px]">None</SelectItem>
                  <SelectItem value="Significant" className="text-[13px]">Significant</SelectItem>
                  <SelectItem value="Deceased" className="text-[13px]">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="relationshipQuality" className="text-[13px]">
                Quality of Relationship
              </Label>
              <Select
                value={relationshipFormData.relationshipQuality || ""}
                onValueChange={(value) => setRelationshipFormData({ ...relationshipFormData, relationshipQuality: value })}
              >
                <SelectTrigger className="text-[13px]">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Positive" className="text-[13px]">Positive</SelectItem>
                  <SelectItem value="Negative" className="text-[13px]">Negative</SelectItem>
                  <SelectItem value="Enmeshed" className="text-[13px]">Enmeshed</SelectItem>
                  <SelectItem value="Turbulent" className="text-[13px]">Turbulent</SelectItem>
                  <SelectItem value="Distant" className="text-[13px]">Distant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="comments" className="text-[13px]">
                Comments and other Relationship details
              </Label>
              <Textarea
                id="comments"
                value={relationshipFormData.comments || ""}
                onChange={(e) => setRelationshipFormData({ ...relationshipFormData, comments: e.target.value })}
                className="text-[13px] min-h-[100px]"
                placeholder="Enter any additional comments or details about the relationship"
              />
            </div>

            {/* Checkboxes Row */}
            <div className="space-y-3 pt-4 border-t border-[#dddbda]">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAdoptiveParent"
                    checked={relationshipFormData.isAdoptiveParent || false}
                    onCheckedChange={(checked) => setRelationshipFormData({ ...relationshipFormData, isAdoptiveParent: !!checked })}
                  />
                  <Label htmlFor="isAdoptiveParent" className="text-[13px] cursor-pointer">
                    Is Adoptive Parent
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="legalGuardian"
                    checked={relationshipFormData.legalGuardian || false}
                    onCheckedChange={(checked) => setRelationshipFormData({ ...relationshipFormData, legalGuardian: !!checked })}
                  />
                  <Label htmlFor="legalGuardian" className="text-[13px] cursor-pointer">
                    Legal Guardian
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="eligibleForPass"
                    checked={relationshipFormData.eligibleForPass || false}
                    onCheckedChange={(checked) => setRelationshipFormData({ ...relationshipFormData, eligibleForPass: !!checked })}
                  />
                  <Label htmlFor="eligibleForPass" className="text-[13px] cursor-pointer">
                    Eligible for Pass
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergencyContact"
                    checked={relationshipFormData.emergencyContact || false}
                    onCheckedChange={(checked) => setRelationshipFormData({ ...relationshipFormData, emergencyContact: !!checked })}
                  />
                  <Label htmlFor="emergencyContact" className="text-[13px] cursor-pointer">
                    Emergency Contact
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddRelationshipDialogOpen(false);
                setRelationshipFormData({});
              }}
              className="rounded-full text-[13px]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveNewRelationship}
              className="rounded-full text-[13px]"
              style={{ backgroundColor: '#145F33' }}
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}