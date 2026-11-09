import { useState } from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { HelpCircle } from "@/app/lib/lucide-icons";

interface LifeEvent {
  id: string;
  startAge: string;
  endAge: string;
  details: string;
}

// Faith options as per requirements
const FAITH_OPTIONS = [
  "Agnostic",
  "Apostolic",
  "Atheist",
  "Baptist",
  "Buddhist",
  "Catholic",
  "Christian",
  "Greek Orthodox",
  "Hebrew Israelite",
  "Islam",
  "Jehovah's Witness",
  "Jewish",
  "Lutheran",
  "Messianic",
  "Methodist",
  "Muslim",
  "Native American",
  "Non-denominational",
  "None",
  "Orthodox",
  "Pentecostal",
  "Presbyterian",
  "Protestant",
  "Unitarian"
];

export function SocialHistorySection() {
  const initialFormData = {
    numberOfPlacements: "",
    sexualOrientation: "",
    sexualHistoryComments: "",
    
    // Sexual History
    willinglyEngaged: "",
    numberOfPartners: "",
    protectionUsed: "",
    protectionComments: "",
    coercedOrForced: "",
    coercedOrForcedComments: "",
    moneyOrItemsExchange: "",
    moneyOrItemsExchangeComments: "",
    
    // Children
    hasChildren: "",
    hasChildrenComments: "",
    
    // Youth Reported Spirituality
    youthAscribeToFaith: "",
    youthAttendServiceRegularly: "",
    youthInterestedInSpiritualDevelopment: "",
    youthSpiritualityComments: "",
    
    // Family Reported Spirituality
    familyAscribeToFaith: "",
    familyAttendServiceRegularly: "",
    familyInterestedInSpiritualDevelopment: "",
    familySpiritualityComments: ""
  };

  const [formData, setFormData] = useState(initialFormData);
  const [savedFormData, setSavedFormData] = useState(initialFormData);

  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>([
    {
      id: "1",
      startAge: "8",
      endAge: "10",
      details: "Lived with grandmother in Detroit, stable period with consistent school attendance"
    },
    {
      id: "2",
      startAge: "10",
      endAge: "12",
      details: "Family relocated to Chicago, experienced adjustment difficulties and social isolation"
    },
    {
      id: "3",
      startAge: "12",
      endAge: "14",
      details: "Placed in foster care following family crisis, attended Lincoln High School"
    }
  ]);

  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LifeEvent | null>(null);
  const [eventForm, setEventForm] = useState({
    startAge: "",
    endAge: "",
    details: ""
  });
  const [eventFormErrors, setEventFormErrors] = useState({
    startAge: "",
    endAge: ""
  });

  // Check if form has unsaved changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(savedFormData);

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Life Event Functions
  const handleAddEvent = () => {
    setShowEventModal(true);
    setEditingEvent(null);
    setEventForm({
      startAge: "",
      endAge: "",
      details: ""
    });
    setEventFormErrors({
      startAge: "",
      endAge: ""
    });
  };

  const handleModifyEvent = (event: LifeEvent) => {
    setEditingEvent(event);
    setEventForm({
      startAge: event.startAge,
      endAge: event.endAge,
      details: event.details
    });
    setEventFormErrors({
      startAge: "",
      endAge: ""
    });
    setShowEventModal(true);
  };

  const validateEventForm = (): boolean => {
    const errors = {
      startAge: "",
      endAge: ""
    };
    let isValid = true;

    // Validate that End Age is not less than Start Age
    if (eventForm.startAge && eventForm.endAge) {
      const startAge = parseFloat(eventForm.startAge);
      const endAge = parseFloat(eventForm.endAge);

      if (!isNaN(startAge) && !isNaN(endAge) && endAge < startAge) {
        errors.endAge = "End age cannot be less than start age";
        isValid = false;
      }
    }

    setEventFormErrors(errors);
    return isValid;
  };

  const handleSaveEvent = () => {
    // Validate form - silently block if invalid
    if (!validateEventForm()) {
      return;
    }

    if (editingEvent) {
      setLifeEvents(lifeEvents.map(item => 
        item.id === editingEvent.id 
          ? { ...item, ...eventForm }
          : item
      ));
    } else {
      const newEvent: LifeEvent = {
        id: Date.now().toString(),
        ...eventForm
      };
      setLifeEvents([...lifeEvents, newEvent]);
    }
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm("Are you sure you want to delete this life event?")) {
      setLifeEvents(lifeEvents.filter(item => item.id !== id));
    }
  };

  const handleSave = () => {
    // Save current state
    setSavedFormData(formData);
    // Here you would normally save to backend/database
  };

  const handleCancel = () => {
    // Revert to saved state
    setFormData(savedFormData);
  };

  return (
    <div className="space-y-6">
      {/* Social History and Life Events */}
      <div>
        <h3 
          className="text-[13px] font-semibold mb-4"
          style={{ 
            color: 'var(--slds-g-color-text-default)'
          }}
        >
          Social History and Life Events
        </h3>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Label 
              htmlFor="num-placements" 
              className="text-[12px] font-semibold uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              # of Reported Placements
            </Label>
            <div className="group relative inline-block">
              <HelpCircle 
                className="h-4 w-4 cursor-help" 
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              />
              <div className="invisible group-hover:visible absolute left-0 top-6 z-50 w-64 p-2 text-[11px] rounded shadow-lg"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
              >
                including at birth through current
              </div>
            </div>
          </div>
          <Input
            id="num-placements"
            type="number"
            min="0"
            step="1"
            className="h-9 text-[13px] rounded max-w-xs"
            style={{
              backgroundColor: 'var(--slds-g-color-background-base)',
              border: '1px solid var(--slds-g-color-border-base-1)',
              color: 'var(--slds-g-color-text-default)'
            }}
            value={formData.numberOfPlacements}
            onChange={(e) => updateField("numberOfPlacements", e.target.value)}
            placeholder="Enter number"
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h4 
            className="text-[13px] font-semibold"
            style={{ color: 'var(--slds-g-color-text-default)' }}
          >
            Notable Life Events
          </h4>
          <Button
            onClick={handleAddEvent}
            className="h-8 px-4 text-[13px] font-medium rounded-full"
            style={{
              backgroundColor: '#145F33',
              color: 'white'
            }}
          >
            Add
          </Button>
        </div>

        {/* Life Events Table */}
        <div 
          className="rounded overflow-hidden"
          style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
        >
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ backgroundColor: 'var(--slds-g-color-neutral-95)' }}>
                <th 
                  className="text-left px-4 py-3 font-semibold uppercase text-[11px] w-32"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Start Age
                </th>
                <th 
                  className="text-left px-4 py-3 font-semibold uppercase text-[11px] w-32"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  End Age
                </th>
                <th 
                  className="text-left px-4 py-3 font-semibold uppercase text-[11px]"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Details
                </th>
                <th 
                  className="text-left px-4 py-3 font-semibold uppercase text-[11px] w-48"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {lifeEvents.length === 0 ? (
                <tr>
                  <td 
                    colSpan={4} 
                    className="px-4 py-8 text-center"
                    style={{ 
                      color: 'var(--slds-g-color-text-weak)',
                      borderTop: '1px solid var(--slds-g-color-border-base-1)'
                    }}
                  >
                    No life events recorded
                  </td>
                </tr>
              ) : (
                lifeEvents.map((event) => (
                  <tr 
                    key={event.id}
                    style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
                  >
                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {event.startAge}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {event.endAge}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {event.details}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleModifyEvent(event)}
                          className="h-7 px-3 text-[12px] font-medium rounded-full"
                          style={{
                            backgroundColor: 'var(--slds-g-color-neutral-95)',
                            color: 'var(--slds-g-color-text-default)',
                            border: '1px solid var(--slds-g-color-border-base-1)'
                          }}
                        >
                          Modify
                        </Button>
                        <Button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="h-7 px-3 text-[12px] font-medium rounded-full"
                          style={{
                            backgroundColor: 'var(--slds-g-color-error-base)',
                            color: 'white'
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sexual Orientation - Moved before Sexual History section */}
      <div>
        <Label 
          htmlFor="sexual-orientation" 
          className="block text-[12px] font-semibold mb-1.5 uppercase" 
          style={{ color: 'var(--slds-g-color-text-weak)' }}
        >
          Reported Sexual Orientation
        </Label>
        <Select value={formData.sexualOrientation} onValueChange={(value) => updateField("sexualOrientation", value)}>
          <SelectTrigger 
            id="sexual-orientation"
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
            <SelectItem value="heterosexual">Heterosexual</SelectItem>
            <SelectItem value="gay">Gay</SelectItem>
            <SelectItem value="bisexual">Bisexual</SelectItem>
            <SelectItem value="unsure">Unsure</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Comments field before Sexual History section */}
      <div>
        <Label 
          htmlFor="sexual-history-comments" 
          className="block text-[12px] font-semibold mb-1.5 uppercase" 
          style={{ color: 'var(--slds-g-color-text-weak)' }}
        >
          Comments
        </Label>
        <Textarea
          id="sexual-history-comments"
          className="text-[13px] rounded min-h-[80px]"
          style={{
            backgroundColor: 'var(--slds-g-color-background-base)',
            border: '1px solid var(--slds-g-color-border-base-1)',
            color: 'var(--slds-g-color-text-default)'
          }}
          value={formData.sexualHistoryComments}
          onChange={(e) => updateField("sexualHistoryComments", e.target.value)}
          placeholder="Enter comments..."
        />
      </div>

      {/* Sexual History */}
      <div>
        <h3 
          className="text-[13px] font-semibold mb-4"
          style={{ 
            color: 'var(--slds-g-color-text-default)'
          }}
        >
          Sexual History
        </h3>

        <div className="space-y-4">
          {/* Willingly engaged */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Have you ever willingly engaged in sexual activity?
            </Label>
            <RadioGroup value={formData.willinglyEngaged} onValueChange={(value) => updateField("willinglyEngaged", value)}>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="willingly-yes" />
                  <label 
                    htmlFor="willingly-yes" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="willingly-no" />
                  <label 
                    htmlFor="willingly-no" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    No
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Number of partners and Protection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label 
                htmlFor="num-partners" 
                className="block text-[12px] font-semibold mb-1.5 uppercase" 
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                Number of Sexual Partners
              </Label>
              <Select value={formData.numberOfPartners} onValueChange={(value) => updateField("numberOfPartners", value)}>
                <SelectTrigger 
                  id="num-partners"
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
                  <SelectItem value="1-5">1-5 Partners</SelectItem>
                  <SelectItem value="6-10">6-10 Partners</SelectItem>
                  <SelectItem value="11-20">11-20 Partners</SelectItem>
                  <SelectItem value="21+">21+ Partners</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label 
                htmlFor="protection-used" 
                className="block text-[12px] font-semibold mb-1.5 uppercase" 
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                Used Protection?
              </Label>
              <Select value={formData.protectionUsed} onValueChange={(value) => updateField("protectionUsed", value)}>
                <SelectTrigger 
                  id="protection-used"
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
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="sometimes">Sometimes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label 
              htmlFor="protection-comments" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Comments
            </Label>
            <Textarea
              id="protection-comments"
              className="text-[13px] rounded min-h-[80px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.protectionComments}
              onChange={(e) => updateField("protectionComments", e.target.value)}
              placeholder="Enter comments..."
            />
          </div>

          {/* Coerced or forced */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Have you ever felt coerced or forced into sexual activity?
            </Label>
            <RadioGroup value={formData.coercedOrForced} onValueChange={(value) => updateField("coercedOrForced", value)}>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="coerced-yes" />
                  <label 
                    htmlFor="coerced-yes" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="coerced-no" />
                  <label 
                    htmlFor="coerced-no" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    No
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label 
              htmlFor="coerced-comments" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Comments
            </Label>
            <Textarea
              id="coerced-comments"
              className="text-[13px] rounded min-h-[80px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.coercedOrForcedComments}
              onChange={(e) => updateField("coercedOrForcedComments", e.target.value)}
              placeholder="Enter comments..."
            />
          </div>

          {/* Money or items exchange */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Have you ever engaged in sexual activity for money or other items?
            </Label>
            <RadioGroup value={formData.moneyOrItemsExchange} onValueChange={(value) => updateField("moneyOrItemsExchange", value)}>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="exchange-yes" />
                  <label 
                    htmlFor="exchange-yes" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="exchange-no" />
                  <label 
                    htmlFor="exchange-no" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    No
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label 
              htmlFor="exchange-comments" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Comments
            </Label>
            <Textarea
              id="exchange-comments"
              className="text-[13px] rounded min-h-[80px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.moneyOrItemsExchangeComments}
              onChange={(e) => updateField("moneyOrItemsExchangeComments", e.target.value)}
              placeholder="Enter comments..."
            />
          </div>

          {/* Do you have any children? */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Do you have any children?
            </Label>
            <RadioGroup value={formData.hasChildren} onValueChange={(value) => updateField("hasChildren", value)}>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="has-children-yes" />
                  <label 
                    htmlFor="has-children-yes" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="has-children-no" />
                  <label 
                    htmlFor="has-children-no" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    No
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label 
              htmlFor="children-comments" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Comments
            </Label>
            <Textarea
              id="children-comments"
              className="text-[13px] rounded min-h-[80px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.hasChildrenComments}
              onChange={(e) => updateField("hasChildrenComments", e.target.value)}
              placeholder="Enter comments..."
            />
          </div>
        </div>
      </div>

      {/* Youth Reported Spirituality */}
      <div>
        <h3 
          className="text-[13px] font-semibold mb-4"
          style={{ 
            color: 'var(--slds-g-color-text-default)'
          }}
        >
          Youth Reported Spirituality
        </h3>

        <div className="space-y-4">
          <div>
            <Label 
              htmlFor="youth-ascribe-faith" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Ascribed to Faith
            </Label>
            <Select value={formData.youthAscribeToFaith} onValueChange={(value) => updateField("youthAscribeToFaith", value)}>
              <SelectTrigger 
                id="youth-ascribe-faith"
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
                {FAITH_OPTIONS.map(faith => (
                  <SelectItem key={faith.toLowerCase().replace(/\s+/g, '-')} value={faith.toLowerCase().replace(/\s+/g, '-')}>
                    {faith}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Attend Service Regularly
            </Label>
            <RadioGroup value={formData.youthAttendServiceRegularly} onValueChange={(value) => updateField("youthAttendServiceRegularly", value)}>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="youth-attend-yes" />
                  <label 
                    htmlFor="youth-attend-yes" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="youth-attend-no" />
                  <label 
                    htmlFor="youth-attend-no" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    No
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Is the youth interested in spiritual development at MHBG?
            </Label>
            <RadioGroup value={formData.youthInterestedInSpiritualDevelopment} onValueChange={(value) => updateField("youthInterestedInSpiritualDevelopment", value)}>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="youth-spiritual-yes" />
                  <label 
                    htmlFor="youth-spiritual-yes" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="youth-spiritual-no" />
                  <label 
                    htmlFor="youth-spiritual-no" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    No
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label 
              htmlFor="youth-spirituality-comments" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Comments
            </Label>
            <Textarea
              id="youth-spirituality-comments"
              className="text-[13px] rounded min-h-[80px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.youthSpiritualityComments}
              onChange={(e) => updateField("youthSpiritualityComments", e.target.value)}
              placeholder="Enter comments..."
            />
          </div>
        </div>
      </div>

      {/* Family Reported Spirituality */}
      <div>
        <h3 
          className="text-[13px] font-semibold mb-4"
          style={{ 
            color: 'var(--slds-g-color-text-default)'
          }}
        >
          Family Reported Spirituality
        </h3>

        <div className="space-y-4">
          <div>
            <Label 
              htmlFor="family-ascribe-faith" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Ascribed to Faith
            </Label>
            <Select value={formData.familyAscribeToFaith} onValueChange={(value) => updateField("familyAscribeToFaith", value)}>
              <SelectTrigger 
                id="family-ascribe-faith"
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
                {FAITH_OPTIONS.map(faith => (
                  <SelectItem key={faith.toLowerCase().replace(/\s+/g, '-')} value={faith.toLowerCase().replace(/\s+/g, '-')}>
                    {faith}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Attend Service Regularly
            </Label>
            <RadioGroup value={formData.familyAttendServiceRegularly} onValueChange={(value) => updateField("familyAttendServiceRegularly", value)}>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="family-attend-yes" />
                  <label 
                    htmlFor="family-attend-yes" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="family-attend-no" />
                  <label 
                    htmlFor="family-attend-no" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    No
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Is the family interested in spiritual development at MHBG?
            </Label>
            <RadioGroup value={formData.familyInterestedInSpiritualDevelopment} onValueChange={(value) => updateField("familyInterestedInSpiritualDevelopment", value)}>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="family-spiritual-yes" />
                  <label 
                    htmlFor="family-spiritual-yes" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="family-spiritual-no" />
                  <label 
                    htmlFor="family-spiritual-no" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    No
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label 
              htmlFor="family-spirituality-comments" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Comments
            </Label>
            <Textarea
              id="family-spirituality-comments"
              className="text-[13px] rounded min-h-[80px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={formData.familySpiritualityComments}
              onChange={(e) => updateField("familySpiritualityComments", e.target.value)}
              placeholder="Enter comments..."
            />
          </div>
        </div>
      </div>

      {/* Save and Cancel Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          onClick={handleCancel}
          disabled={!hasChanges}
          className="h-9 px-6 rounded-full text-[13px] font-semibold"
          style={{
            backgroundColor: 'var(--slds-g-color-background-base)',
            border: '1px solid var(--slds-g-color-border-base-1)',
            color: 'var(--slds-g-color-text-default)',
            opacity: hasChanges ? 1 : 0.5
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="h-9 px-6 rounded-full text-[13px] font-semibold"
          style={{
            backgroundColor: '#145F33',
            color: 'white',
            opacity: hasChanges ? 1 : 0.5
          }}
        >
          Save
        </Button>
      </div>

      {/* Life Event Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent 
          className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: 'var(--slds-g-color-background-base)',
            border: '1px solid var(--slds-g-color-border-base-1)'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold" style={{ color: 'var(--slds-g-color-text-default)' }}>
              {editingEvent ? "Modify Life Event" : "Add New Life Event"}
            </DialogTitle>
            <DialogDescription className="text-[13px] font-normal" style={{ color: 'var(--slds-g-color-text-weak)' }}>
              Enter details about the notable life event.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-age" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  Start Age
                </Label>
                <Input
                  id="start-age"
                  type="number"
                  min="0"
                  step="1"
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: eventFormErrors.startAge ? '1px solid #c23934' : '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={eventForm.startAge}
                  onChange={(e) => {
                    setEventForm({ ...eventForm, startAge: e.target.value });
                    setEventFormErrors({ ...eventFormErrors, startAge: "" });
                  }}
                  placeholder="e.g., 8"
                />
                {eventFormErrors.startAge && (
                  <p className="text-[11px] mt-1" style={{ color: '#c23934' }}>
                    {eventFormErrors.startAge}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="end-age" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                  End Age
                </Label>
                <Input
                  id="end-age"
                  type="number"
                  min="0"
                  step="1"
                  className="h-9 text-[13px] rounded"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: eventFormErrors.endAge ? '1px solid #c23934' : '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={eventForm.endAge}
                  onChange={(e) => {
                    setEventForm({ ...eventForm, endAge: e.target.value });
                    setEventFormErrors({ ...eventFormErrors, endAge: "" });
                  }}
                  placeholder="e.g., 10"
                />
                {eventFormErrors.endAge && (
                  <p className="text-[11px] mt-1" style={{ color: '#c23934' }}>
                    {eventFormErrors.endAge}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="event-details" className="block text-[12px] font-semibold mb-1.5 uppercase" style={{ color: 'var(--slds-g-color-text-weak)' }}>
                Details
              </Label>
              <Textarea
                id="event-details"
                className="text-[13px] rounded min-h-[100px]"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
                value={eventForm.details}
                onChange={(e) => setEventForm({ ...eventForm, details: e.target.value })}
                placeholder="Enter details about the life event..."
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              onClick={() => setShowEventModal(false)}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: 'var(--slds-g-color-neutral-95)',
                color: 'var(--slds-g-color-text-default)',
                border: '1px solid var(--slds-g-color-border-base-1)'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEvent}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: '#145F33',
                color: 'white'
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}