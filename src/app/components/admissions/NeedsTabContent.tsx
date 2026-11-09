import { useState } from "react";
import { Pencil, Trash2 } from "@/app/lib/lucide-icons";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner@2.0.3";

interface PsychosocialFactor {
  id: number;
  factor: string;
  locations: string[];
  details: string;
}

export function NeedsTabContent() {
  // Psychosocial Factors State
  const [psychosocialFactors, setPsychosocialFactors] =
    useState<PsychosocialFactor[]>([
      {
        id: 1,
        factor: "Academic Problems",
        locations: ["Home", "Community"],
        details: "Student is struggling with math and reading.",
      },
      {
        id: 2,
        factor: "Family Issues",
        locations: ["Home"],
        details:
          "Student is experiencing conflict with parents.",
      },
      {
        id: 3,
        factor: "Behavioral Issues",
        locations: ["School", "Community"],
        details:
          "Student has been displaying disruptive behavior.",
      },
    ]);
  const [psychosocialDialogOpen, setPsychosocialDialogOpen] =
    useState(false);
  const [editingPsychosocialId, setEditingPsychosocialId] =
    useState<number | null>(null);
  const [psychosocialFormData, setPsychosocialFormData] =
    useState({
      factor: "",
      locations: [] as string[],
      details: "",
    });

  // Psychosocial Factors Handlers
  const handleAddPsychosocial = () => {
    setPsychosocialFormData({
      factor: "",
      locations: [],
      details: "",
    });
    setEditingPsychosocialId(null);
    setPsychosocialDialogOpen(true);
  };

  const handleEditPsychosocial = (
    factor: PsychosocialFactor,
  ) => {
    setPsychosocialFormData({
      factor: factor.factor,
      locations: factor.locations,
      details: factor.details,
    });
    setEditingPsychosocialId(factor.id);
    setPsychosocialDialogOpen(true);
  };

  const handleDeletePsychosocial = (id: number) => {
    setPsychosocialFactors(
      psychosocialFactors.filter((f) => f.id !== id),
    );
    toast.success("Psychosocial factor deleted successfully");
  };

  const handleSavePsychosocial = () => {
    if (
      !psychosocialFormData.factor ||
      !psychosocialFormData.locations.length ||
      !psychosocialFormData.details
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingPsychosocialId) {
      setPsychosocialFactors(
        psychosocialFactors.map((f) =>
          f.id === editingPsychosocialId
            ? { ...f, ...psychosocialFormData }
            : f,
        ),
      );
      toast.success("Psychosocial factor updated successfully");
    } else {
      const newFactor: PsychosocialFactor = {
        id:
          Math.max(0, ...psychosocialFactors.map((f) => f.id)) +
          1,
        ...psychosocialFormData,
      };
      setPsychosocialFactors([
        ...psychosocialFactors,
        newFactor,
      ]);
      toast.success("Psychosocial factor added successfully");
    }

    setPsychosocialDialogOpen(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Reason for seeking placement */}
        <div>
          <h4
            className="text-[13px] font-semibold mb-4 pb-2"
            style={{
              color: "var(--slds-g-color-text-default)",
              borderBottom:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            Reason for seeking placement
          </h4>

          <div>
            <Label
              htmlFor="placement-narrative"
              className="block text-[11px] font-semibold mb-1.5 uppercase"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Narrative
            </Label>
            <Textarea
              id="placement-narrative"
              className="text-[13px] rounded min-h-[120px]"
              style={{
                backgroundColor:
                  "var(--slds-g-color-background-base)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
              }}
              placeholder="Enter narrative for reason for seeking placement..."
            />
          </div>
        </div>

        {/* Psychosocial Factors */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4
              className="text-[13px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Psychosocial Factors
            </h4>
            <div className="flex gap-2">
              <button
                onClick={handleAddPsychosocial}
                className="px-3 py-1.5 text-xs font-semibold text-white rounded-full transition-colors hover:opacity-90"
                style={{ backgroundColor: "#145F33" }}
              >
                Add
              </button>
            </div>
          </div>

          <div
            className="rounded overflow-hidden"
            style={{
              border:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            <table className="w-full text-[13px]">
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      "var(--slds-g-color-neutral-95)",
                  }}
                >
                  <th
                    className="text-left px-4 py-3 font-semibold uppercase text-[11px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Psychosocial Factors
                  </th>
                  <th
                    className="text-left px-4 py-3 font-semibold uppercase text-[11px]"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Occurrence
                  </th>
                  <th
                    className="text-center px-4 py-3 font-semibold uppercase text-[11px] w-24"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {psychosocialFactors.map((factor) => (
                  <tr
                    key={factor.id}
                    style={{
                      borderTop:
                        "1px solid var(--slds-g-color-border-base-1)",
                    }}
                  >
                    <td
                      className="px-4 py-3"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {factor.factor}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{
                        color:
                          "var(--slds-g-color-text-default)",
                      }}
                    >
                      {factor.locations.join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            handleEditPsychosocial(factor)
                          }
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Pencil
                            className="h-4 w-4"
                            style={{ color: "#145F33" }}
                          />
                        </button>
                        <button
                          onClick={() =>
                            handleDeletePsychosocial(factor.id)
                          }
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Trash2
                            className="h-4 w-4"
                            style={{ color: "#c23934" }}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Psychosocial Factors Dialog */}
      <Dialog
        open={psychosocialDialogOpen}
        onOpenChange={setPsychosocialDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {editingPsychosocialId
                ? "Edit Psychosocial Factor"
                : "Add Psychosocial Factor"}
            </DialogTitle>
            <DialogDescription>
              {editingPsychosocialId
                ? "Update the psychosocial factor details below."
                : "Enter the details for the new psychosocial factor."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label
                htmlFor="factor"
                className="text-[12px] font-semibold uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Factor *
              </Label>
              <Select
                value={psychosocialFormData.factor}
                onValueChange={(value) =>
                  setPsychosocialFormData({
                    ...psychosocialFormData,
                    factor: value,
                  })
                }
              >
                <SelectTrigger
                  id="factor"
                  className="text-[13px]"
                >
                  <SelectValue placeholder="Select factor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Academic Problems">
                    Academic Problems
                  </SelectItem>
                  <SelectItem value="Behavioral Issues">
                    Behavioral Issues
                  </SelectItem>
                  <SelectItem value="Community Issues">
                    Community Issues
                  </SelectItem>
                  <SelectItem value="Financial Challenges">
                    Financial Challenges
                  </SelectItem>
                  <SelectItem value="Family Issues">
                    Family Issues
                  </SelectItem>
                  <SelectItem value="Independent Living Skills">
                    Independent Living Skills
                  </SelectItem>
                  <SelectItem value="Mental Health Support">
                    Mental Health Support
                  </SelectItem>
                  <SelectItem value="Substance Abuse Issues">
                    Substance Abuse Issues
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                className="text-[12px] font-semibold uppercase mb-1.5 block"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Occurrence *
              </Label>
              <div
                className="rounded overflow-hidden"
                style={{
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                }}
              >
                <table className="w-full text-[13px]">
                  <thead>
                    <tr
                      style={{
                        backgroundColor:
                          "var(--slds-g-color-neutral-95)",
                      }}
                    >
                      <th
                        className="text-left px-3 py-2 font-semibold uppercase text-[11px]"
                        style={{
                          color:
                            "var(--slds-g-color-text-weak)",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="all"
                            checked={
                              psychosocialFormData.locations
                                .length === 4
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setPsychosocialFormData({
                                  ...psychosocialFormData,
                                  locations: [
                                    "Home",
                                    "Community",
                                    "School",
                                    "All",
                                  ],
                                });
                              } else {
                                setPsychosocialFormData({
                                  ...psychosocialFormData,
                                  locations: [],
                                });
                              }
                            }}
                          />
                          <Label
                            htmlFor="all"
                            className="text-[11px] font-semibold uppercase cursor-pointer"
                            style={{
                              color:
                                "var(--slds-g-color-text-weak)",
                            }}
                          >
                            All - Id 1099
                          </Label>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Home", id: "1100" },
                      { name: "Community", id: "1101" },
                      { name: "School", id: "1102" },
                    ].map((location) => (
                      <tr
                        key={location.name}
                        style={{
                          borderTop:
                            "1px solid var(--slds-g-color-border-base-1)",
                        }}
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={location.name.toLowerCase()}
                              checked={psychosocialFormData.locations.includes(
                                location.name,
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  const newLocations = [
                                    ...psychosocialFormData.locations,
                                    location.name,
                                  ];
                                  setPsychosocialFormData({
                                    ...psychosocialFormData,
                                    locations: newLocations,
                                  });
                                } else {
                                  setPsychosocialFormData({
                                    ...psychosocialFormData,
                                    locations:
                                      psychosocialFormData.locations.filter(
                                        (loc) =>
                                          loc !==
                                            location.name &&
                                          loc !== "All",
                                      ),
                                  });
                                }
                              }}
                            />
                            <Label
                              htmlFor={location.name.toLowerCase()}
                              className="text-[13px] cursor-pointer"
                              style={{
                                color:
                                  "var(--slds-g-color-text-default)",
                              }}
                            >
                              {location.name} - Id {location.id}
                            </Label>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <Label
                htmlFor="details"
                className="text-[12px] font-semibold uppercase"
                style={{
                  color: "var(--slds-g-color-text-weak)",
                }}
              >
                Details *
              </Label>
              <Textarea
                id="details"
                className="text-[13px] rounded min-h-[120px]"
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-base)",
                  border:
                    "1px solid var(--slds-g-color-border-base-1)",
                  color: "var(--slds-g-color-text-default)",
                }}
                placeholder="Enter details for the psychosocial factor..."
                value={psychosocialFormData.details}
                onChange={(e) =>
                  setPsychosocialFormData({
                    ...psychosocialFormData,
                    details: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPsychosocialDialogOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePsychosocial}
              className="rounded-full text-white"
              style={{ backgroundColor: "#145F33" }}
            >
              {editingPsychosocialId ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}