import { useState } from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";

interface SubstanceRow {
  id: string;
  substance: string;
  ageFirstUsed: string;
  ageLastUsed: string;
  frequency: string;
  amount: string;
  methodsOfUse: string;
}

const METHOD_OPTIONS = [
  "Swallowing",
  "Smoking",
  "Snorting",
  "Suppositories",
  "Injecting",
  "Inhaling",
  "Applied to Skin",
  "Under the Tongue",
  "Unknown"
];

export function SubstanceUseSection() {
  const [substanceRows, setSubstanceRows] = useState<SubstanceRow[]>([
    {
      id: "1",
      substance: "Marijuana",
      ageFirstUsed: "14",
      ageLastUsed: "16",
      frequency: "Weekly",
      amount: "1-2 joints",
      methodsOfUse: "Smoking"
    },
    {
      id: "2",
      substance: "Alcohol",
      ageFirstUsed: "15",
      ageLastUsed: "17",
      frequency: "Monthly",
      amount: "3-4 drinks",
      methodsOfUse: "Swallowing"
    },
    {
      id: "3",
      substance: "Prescription Opioids",
      ageFirstUsed: "16",
      ageLastUsed: "Unknown",
      frequency: "Daily",
      amount: "2-3 pills",
      methodsOfUse: "Swallowing, Snorting"
    }
  ]);
  const [hasUsedSubstances, setHasUsedSubstances] = useState("");
  const [hasParticipatedInTreatment, setHasParticipatedInTreatment] = useState("");
  const [comments, setComments] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Form state
  const [substance, setSubstance] = useState("");
  const [ageFirstUsedType, setAgeFirstUsedType] = useState("");
  const [ageFirstUsedValue, setAgeFirstUsedValue] = useState("");
  const [ageLastUsedType, setAgeLastUsedType] = useState("");
  const [ageLastUsedValue, setAgeLastUsedValue] = useState("");
  const [frequency, setFrequency] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [otherMethod, setOtherMethod] = useState("");
  const [methodSearch, setMethodSearch] = useState("");

  const resetForm = () => {
    setSubstance("");
    setAgeFirstUsedType("");
    setAgeFirstUsedValue("");
    setAgeLastUsedType("");
    setAgeLastUsedValue("");
    setFrequency("");
    setAmount("");
    setSelectedMethods([]);
    setOtherMethod("");
    setMethodSearch("");
  };

  const handleAddSubstance = () => {
    if (substance) {
      const ageFirst = ageFirstUsedType === "Known Age" ? ageFirstUsedValue : "Unknown";
      const ageLast = ageLastUsedType === "Known Age" ? ageLastUsedValue : "Unknown";
      const methods = [...selectedMethods];
      if (otherMethod) {
        methods.push(otherMethod);
      }
      
      setSubstanceRows([
        ...substanceRows,
        {
          id: Date.now().toString(),
          substance,
          ageFirstUsed: ageFirst,
          ageLastUsed: ageLast,
          frequency,
          amount,
          methodsOfUse: methods.join(", ")
        }
      ]);
      resetForm();
      setIsAddDialogOpen(false);
    }
  };

  const handleModifySubstance = (row: SubstanceRow) => {
    setSubstance(row.substance);
    setAgeFirstUsedType(row.ageFirstUsed === "Unknown" ? "Unknown Age" : "Known Age");
    setAgeFirstUsedValue(row.ageFirstUsed === "Unknown" ? "" : row.ageFirstUsed);
    setAgeLastUsedType(row.ageLastUsed === "Unknown" ? "Unknown Age" : "Known Age");
    setAgeLastUsedValue(row.ageLastUsed === "Unknown" ? "" : row.ageLastUsed);
    setFrequency(row.frequency);
    setAmount(row.amount);
    
    // Parse methods back into checkboxes
    const methods = row.methodsOfUse.split(", ").filter(m => m);
    const knownMethods = methods.filter(m => METHOD_OPTIONS.includes(m));
    const unknownMethods = methods.filter(m => !METHOD_OPTIONS.includes(m));
    
    setSelectedMethods(knownMethods);
    setOtherMethod(unknownMethods.join(", "));
    setIsAddDialogOpen(true);
  };

  const handleDeleteSubstance = (id: string) => {
    setSubstanceRows(substanceRows.filter(row => row.id !== id));
  };

  const toggleMethod = (method: string) => {
    setSelectedMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const handleAddOtherMethod = () => {
    if (otherMethod.trim()) {
      // Just keep it in the otherMethod state, it will be added when saving
    }
  };

  const filteredMethods = METHOD_OPTIONS.filter(method =>
    method.toLowerCase().includes(methodSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Substance Use History Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 
            className="text-[13px] font-semibold"
            style={{ color: 'var(--slds-g-color-text-default)' }}
          >
            Substance Use History
          </h3>
          <Button
            onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}
            className="h-8 px-4 text-[13px] font-medium rounded-full"
            style={{
              backgroundColor: '#145F33',
              color: 'white'
            }}
          >
            Add New
          </Button>
        </div>

        <div 
          className="rounded overflow-hidden mb-6"
          style={{ border: '1px solid var(--slds-g-color-border-base-1)' }}
        >
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ backgroundColor: 'var(--slds-g-color-neutral-95)' }}>
                <th 
                  className="text-left px-4 py-3 font-semibold uppercase text-[11px]"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Substance
                </th>
                <th 
                  className="text-left px-4 py-3 font-semibold uppercase text-[11px]"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Age First Used
                </th>
                <th 
                  className="text-left px-4 py-3 font-semibold uppercase text-[11px]"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Age Last Used
                </th>
                <th 
                  className="text-left px-4 py-3 font-semibold uppercase text-[11px]"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Frequency
                </th>
                <th 
                  className="text-left px-4 py-3 font-semibold uppercase text-[11px]"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Amount
                </th>
                <th 
                  className="text-left px-4 py-3 font-semibold uppercase text-[11px]"
                  style={{ color: 'var(--slds-g-color-text-weak)' }}
                >
                  Method(s) of Use
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
              {substanceRows.length === 0 ? (
                <tr>
                  <td 
                    colSpan={7} 
                    className="px-4 py-8 text-center"
                    style={{ 
                      color: 'var(--slds-g-color-text-weak)',
                      borderTop: '1px solid var(--slds-g-color-border-base-1)'
                    }}
                  >
                    No substance use history recorded
                  </td>
                </tr>
              ) : (
                substanceRows.map((row, index) => (
                  <tr 
                    key={row.id}
                    style={{ borderTop: '1px solid var(--slds-g-color-border-base-1)' }}
                  >
                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {row.substance}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {row.ageFirstUsed}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {row.ageLastUsed}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {row.frequency}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {row.amount}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--slds-g-color-text-default)' }}>
                      {row.methodsOfUse}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleModifySubstance(row)}
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
                          onClick={() => handleDeleteSubstance(row.id)}
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

        <div className="space-y-4">
          {/* Has the youth ever used substances? */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Has the youth ever used substances?
            </Label>
            <RadioGroup value={hasUsedSubstances} onValueChange={setHasUsedSubstances}>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="used-substances-yes" />
                  <label 
                    htmlFor="used-substances-yes" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="used-substances-no" />
                  <label 
                    htmlFor="used-substances-no" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    No
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="unknown" id="used-substances-unknown" />
                  <label 
                    htmlFor="used-substances-unknown" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Unknown
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Has the youth ever participated in substance use treatment? */}
          <div>
            <Label 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Has the youth ever participated in substance use treatment?
            </Label>
            <RadioGroup value={hasParticipatedInTreatment} onValueChange={setHasParticipatedInTreatment}>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="yes" id="treatment-yes" />
                  <label 
                    htmlFor="treatment-yes" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Yes
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no" id="treatment-no" />
                  <label 
                    htmlFor="treatment-no" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    No
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="unknown" id="treatment-unknown" />
                  <label 
                    htmlFor="treatment-unknown" 
                    className="text-[13px] cursor-pointer"
                    style={{ color: 'var(--slds-g-color-text-default)' }}
                  >
                    Unknown
                  </label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Comments */}
          <div>
            <Label 
              htmlFor="substance-comments" 
              className="block text-[12px] font-semibold mb-1.5 uppercase" 
              style={{ color: 'var(--slds-g-color-text-weak)' }}
            >
              Comments
            </Label>
            <Textarea
              id="substance-comments"
              className="text-[13px] rounded min-h-[120px]"
              style={{
                backgroundColor: 'var(--slds-g-color-background-base)',
                border: '1px solid var(--slds-g-color-border-base-1)',
                color: 'var(--slds-g-color-text-default)'
              }}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter any additional comments regarding substance use history..."
            />
          </div>
        </div>
      </div>

      {/* Add Substance Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent size="md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              Add Substance Use
            </DialogTitle>
            <DialogDescription>
              Enter the details of the substance use.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-4">
            {/* Substance */}
            <div>
              <Label 
                htmlFor="substance" 
                className="block text-[12px] font-semibold mb-1.5 uppercase" 
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                Substance
              </Label>
              <Input
                id="substance"
                className="text-[13px] rounded"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
                value={substance}
                onChange={(e) => setSubstance(e.target.value)}
                placeholder="Enter substance..."
              />
            </div>

            {/* Age First Used */}
            <div>
              <Label 
                htmlFor="age-first-used-type" 
                className="block text-[12px] font-semibold mb-1.5 uppercase" 
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                Age First Used
              </Label>
              <Select value={ageFirstUsedType} onValueChange={setAgeFirstUsedType}>
                <SelectTrigger 
                  id="age-first-used-type"
                  className="text-[13px] rounded"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Known Age">Known Age</SelectItem>
                  <SelectItem value="Unknown Age">Unknown Age</SelectItem>
                </SelectContent>
              </Select>
              {ageFirstUsedType === "Known Age" && (
                <Input
                  className="text-[13px] rounded mt-2"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={ageFirstUsedValue}
                  onChange={(e) => setAgeFirstUsedValue(e.target.value)}
                  placeholder="Enter age..."
                />
              )}
            </div>

            {/* Age Last Used */}
            <div>
              <Label 
                htmlFor="age-last-used-type" 
                className="block text-[12px] font-semibold mb-1.5 uppercase" 
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                Age Last Used
              </Label>
              <Select value={ageLastUsedType} onValueChange={setAgeLastUsedType}>
                <SelectTrigger 
                  id="age-last-used-type"
                  className="text-[13px] rounded"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Known Age">Known Age</SelectItem>
                  <SelectItem value="Unknown Age">Unknown Age</SelectItem>
                </SelectContent>
              </Select>
              {ageLastUsedType === "Known Age" && (
                <Input
                  className="text-[13px] rounded mt-2"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                  value={ageLastUsedValue}
                  onChange={(e) => setAgeLastUsedValue(e.target.value)}
                  placeholder="Enter age..."
                />
              )}
            </div>

            {/* Frequency */}
            <div>
              <Label 
                htmlFor="frequency" 
                className="block text-[12px] font-semibold mb-1.5 uppercase" 
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                Frequency
              </Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger 
                  id="frequency"
                  className="text-[13px] rounded"
                  style={{
                    backgroundColor: 'var(--slds-g-color-background-base)',
                    border: '1px solid var(--slds-g-color-border-base-1)',
                    color: 'var(--slds-g-color-text-default)'
                  }}
                >
                  <SelectValue placeholder="Select frequency..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Daily">Daily</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div>
              <Label 
                htmlFor="amount" 
                className="block text-[12px] font-semibold mb-1.5 uppercase" 
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                Amount
              </Label>
              <Input
                id="amount"
                className="text-[13px] rounded"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount..."
              />
            </div>

            {/* Method(s) of Use */}
            <div>
              <Label 
                className="block text-[12px] font-semibold mb-1.5 uppercase" 
                style={{ color: 'var(--slds-g-color-text-weak)' }}
              >
                Method(s) of Use
              </Label>
              
              {/* Search Box */}
              <Input
                className="text-[13px] rounded mb-3"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)',
                  color: 'var(--slds-g-color-text-default)'
                }}
                value={methodSearch}
                onChange={(e) => setMethodSearch(e.target.value)}
                placeholder="Search methods..."
              />

              {/* Method Checkboxes */}
              <div 
                className="rounded p-3 space-y-2 max-h-[200px] overflow-y-auto"
                style={{
                  backgroundColor: 'var(--slds-g-color-background-base)',
                  border: '1px solid var(--slds-g-color-border-base-1)'
                }}
              >
                {filteredMethods.map((method) => (
                  <div key={method} className="flex items-center gap-2">
                    <Checkbox
                      id={`method-${method}`}
                      checked={selectedMethods.includes(method)}
                      onCheckedChange={() => toggleMethod(method)}
                    />
                    <label
                      htmlFor={`method-${method}`}
                      className="text-[13px] cursor-pointer"
                      style={{ color: 'var(--slds-g-color-text-default)' }}
                    >
                      {method}
                    </label>
                  </div>
                ))}
              </div>

              {/* Other Method */}
              <div className="mt-3">
                <div className="flex gap-2">
                  <Input
                    className="text-[13px] rounded flex-1"
                    style={{
                      backgroundColor: 'var(--slds-g-color-background-base)',
                      border: '1px solid var(--slds-g-color-border-base-1)',
                      color: 'var(--slds-g-color-text-default)'
                    }}
                    value={otherMethod}
                    onChange={(e) => setOtherMethod(e.target.value)}
                    placeholder="Other method..."
                  />
                  <Button
                    onClick={handleAddOtherMethod}
                    className="h-9 px-4 text-[13px] font-medium rounded-full"
                    style={{
                      backgroundColor: '#145F33',
                      color: 'white'
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="gap-2">
            <Button
              onClick={() => setIsAddDialogOpen(false)}
              className="h-9 px-4 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: 'var(--slds-g-color-neutral-95)',
                color: 'var(--slds-g-color-text-default)',
                border: '1px solid var(--slds-g-color-border-base-1)'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddSubstance}
              className="h-9 px-4 text-[13px] font-medium rounded-full"
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