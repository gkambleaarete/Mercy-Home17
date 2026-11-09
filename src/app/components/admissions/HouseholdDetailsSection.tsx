import { useState } from "react";
import { Button } from "../ui/button";
import { Pencil, Trash2, Plus } from "@/app/lib/lucide-icons";
import { toast } from "sonner@2.0.3";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { getDemoUserName } from "../../lib/demoIdentity";

interface HouseholdHistoryEntry {
  id: number;
  modifyDateTime: string;
  modifier: string;
  field: string;
  previousValue: string;
  newValue: string;
}

interface HouseholdDetail {
  id: number;
  householdSize: string;
  annualIncome: string;
}

export function HouseholdDetailsSection() {
  // Current household details
  const [householdId] = useState("HH-2024-001");
  const [householdSize, setHouseholdSize] = useState("4");
  const [annualIncome, setAnnualIncome] = useState("$45,000");

  // Household Details Records
  const [householdDetails, setHouseholdDetails] = useState<
    HouseholdDetail[]
  >([
    {
      id: 1,
      householdSize: "4",
      annualIncome: "$45,000",
    },
    {
      id: 2,
      householdSize: "3",
      annualIncome: "$42,000",
    },
  ]);

  // History tracking
  const [historyEntries, setHistoryEntries] = useState<
    HouseholdHistoryEntry[]
  >([
    {
      id: 1,
      modifyDateTime: "12/10/2024 10:30 AM",
      modifier: "Sarah Johnson",
      field: "Household Size",
      previousValue: "3",
      newValue: "4",
    },
    {
      id: 2,
      modifyDateTime: "12/08/2024 2:15 PM",
      modifier: "Michael Chen",
      field: "Annual Income",
      previousValue: "$42,000",
      newValue: "$45,000",
    },
    {
      id: 3,
      modifyDateTime: "12/05/2024 9:45 AM",
      modifier: "Sarah Johnson",
      field: "Household Size",
      previousValue: "2",
      newValue: "3",
    },
    {
      id: 4,
      modifyDateTime: "12/01/2024 11:20 AM",
      modifier: "Jennifer Williams",
      field: "Annual Income",
      previousValue: "$40,000",
      newValue: "$42,000",
    },
  ]);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newDetailDialogOpen, setNewDetailDialogOpen] =
    useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] =
    useState(false);
  const [editingHistoryId, setEditingHistoryId] = useState<
    number | null
  >(null);
  const [historyFormData, setHistoryFormData] = useState<
    Omit<HouseholdHistoryEntry, "id">
  >({
    modifyDateTime: "",
    modifier: "",
    field: "",
    previousValue: "",
    newValue: "",
  });

  // New household detail form
  const [newDetailFormData, setNewDetailFormData] = useState<
    Omit<HouseholdDetail, "id">
  >({
    householdSize: "",
    annualIncome: "",
  });

  // Edit household details
  const [tempHouseholdSize, setTempHouseholdSize] =
    useState("");
  const [tempAnnualIncome, setTempAnnualIncome] = useState("");

  const handleEditHousehold = () => {
    setTempHouseholdSize(householdSize);
    setTempAnnualIncome(annualIncome);
    setEditDialogOpen(true);
  };

  const handleSaveHousehold = () => {
    if (!tempHouseholdSize.trim()) {
      toast.error("Please enter a household size");
      return;
    }
    if (!tempAnnualIncome.trim()) {
      toast.error("Please enter an annual income");
      return;
    }

    // Add history entries for changed fields
    const currentDateTime = new Date().toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const currentUser = getDemoUserName();

    let newEntries: HouseholdHistoryEntry[] = [];
    let nextId =
      Math.max(...historyEntries.map((e) => e.id), 0) + 1;

    if (tempHouseholdSize !== householdSize) {
      newEntries.push({
        id: nextId++,
        modifyDateTime: currentDateTime,
        modifier: currentUser,
        field: "Household Size",
        previousValue: householdSize,
        newValue: tempHouseholdSize,
      });
    }

    if (tempAnnualIncome !== annualIncome) {
      newEntries.push({
        id: nextId++,
        modifyDateTime: currentDateTime,
        modifier: currentUser,
        field: "Annual Income",
        previousValue: annualIncome,
        newValue: tempAnnualIncome,
      });
    }

    if (newEntries.length > 0) {
      setHistoryEntries([...newEntries, ...historyEntries]);
    }

    setHouseholdSize(tempHouseholdSize);
    setAnnualIncome(tempAnnualIncome);
    setEditDialogOpen(false);
    toast.success("Household details updated successfully");
  };

  // History CRUD handlers
  const handleAddHistory = () => {
    setEditingHistoryId(null);
    setHistoryFormData({
      modifyDateTime: new Date().toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      modifier: "",
      field: "Household Size",
      previousValue: "",
      newValue: "",
    });
    setHistoryDialogOpen(true);
  };

  const handleEditHistory = (entry: HouseholdHistoryEntry) => {
    setEditingHistoryId(entry.id);
    setHistoryFormData({
      modifyDateTime: entry.modifyDateTime,
      modifier: entry.modifier,
      field: entry.field,
      previousValue: entry.previousValue,
      newValue: entry.newValue,
    });
    setHistoryDialogOpen(true);
  };

  const handleSaveHistory = () => {
    if (!historyFormData.modifier.trim()) {
      toast.error("Please enter a modifier name");
      return;
    }
    if (!historyFormData.previousValue.trim()) {
      toast.error("Please enter a previous value");
      return;
    }
    if (!historyFormData.newValue.trim()) {
      toast.error("Please enter a new value");
      return;
    }

    if (editingHistoryId) {
      setHistoryEntries(
        historyEntries.map((e) =>
          e.id === editingHistoryId
            ? { ...e, ...historyFormData }
            : e,
        ),
      );
      toast.success("History entry updated successfully");
    } else {
      const newId =
        Math.max(...historyEntries.map((e) => e.id), 0) + 1;
      setHistoryEntries([
        { id: newId, ...historyFormData },
        ...historyEntries,
      ]);
      toast.success("History entry added successfully");
    }

    setHistoryDialogOpen(false);
    setEditingHistoryId(null);
  };

  const handleDeleteHistory = (id: number) => {
    setHistoryEntries(
      historyEntries.filter((entry) => entry.id !== id),
    );
    toast.success("History entry deleted");
  };

  // New Household Detail handlers
  const handleAddNewDetail = () => {
    setNewDetailFormData({
      householdSize: "",
      annualIncome: "",
    });
    setNewDetailDialogOpen(true);
  };

  const handleSaveNewDetail = () => {
    if (!newDetailFormData.householdSize.trim()) {
      toast.error("Please enter a household size");
      return;
    }
    if (!newDetailFormData.annualIncome.trim()) {
      toast.error("Please enter an annual income");
      return;
    }

    const newId =
      Math.max(...householdDetails.map((d) => d.id), 0) + 1;
    const newDetail: HouseholdDetail = {
      id: newId,
      ...newDetailFormData,
    };
    setHouseholdDetails([newDetail, ...householdDetails]);
    setNewDetailDialogOpen(false);
    toast.success("Household detail added successfully");
  };

  return (
    <div className="space-y-6">
      {/* Household Details Card */}
      <div
        className="overflow-hidden"
        style={{
          border: "1px solid var(--slds-g-color-border-base-1)",
          borderRadius: "var(--slds-c-card-radius-border)",
          backgroundColor:
            "var(--slds-g-color-background-base)",
        }}
      >
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <h3 className="text-[13px] font-semibold text-[#080707]">
            Household Details
          </h3>
          <div className="flex items-center gap-2">
            <button
              className="px-2 py-1 bg-transparent font-medium flex items-center gap-1.5 bh-outlined-primary"
              onClick={handleEditHousehold}
              style={{
                color: "var(--color-brand-primary)",
                border:
                  "1.5px solid var(--color-brand-primary)",
                borderRadius: "9999px",
                fontSize: "var(--slds-g-font-size-3)",
              }}
            >
              <Pencil className="h-3 w-auto" /> Edit
            </button>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div
              className="text-[11px] font-medium mb-1"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              HOUSEHOLD SIZE
            </div>
            <div className="text-[13px] font-medium text-[#080707]">
              {householdSize}
            </div>
          </div>
          <div>
            <div
              className="text-[11px] font-medium mb-1"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              ANNUAL INCOME
            </div>
            <div className="text-[13px] font-medium text-[#080707]">
              {annualIncome}
            </div>
          </div>
        </div>

        {/* Income and Size History Section */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{
            borderTop:
              "1px solid var(--slds-g-color-border-base-1)",
            borderBottom:
              "1px solid var(--slds-g-color-border-base-1)",
            backgroundColor:
              "var(--slds-g-color-background-alt)",
          }}
        >
          <h4 className="text-[12px] font-semibold text-[#080707]">
            Income and Size History ({historyEntries.length})
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr
                style={{
                  backgroundColor:
                    "var(--slds-g-color-background-alt)",
                }}
              >
                <th
                  className="px-3 py-2 text-left font-semibold text-[11px]"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  MODIFY DATE/TIME
                </th>
                <th
                  className="px-3 py-2 text-left font-semibold text-[11px]"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  MODIFIER
                </th>
                <th
                  className="px-3 py-2 text-left font-semibold text-[11px]"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  FIELD
                </th>
                <th
                  className="px-3 py-2 text-left font-semibold text-[11px]"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  PREVIOUS VALUE
                </th>
                <th
                  className="px-3 py-2 text-left font-semibold text-[11px]"
                  style={{
                    color: "var(--slds-g-color-text-weak)",
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  NEW VALUE
                </th>
              </tr>
            </thead>
            <tbody>
              {historyEntries.map((entry) => (
                <tr
                  key={entry.id}
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                  }}
                >
                  <td
                    className="px-3 py-3 text-[13px]"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {entry.modifyDateTime}
                  </td>
                  <td
                    className="px-3 py-3 text-[13px]"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {entry.modifier}
                  </td>
                  <td
                    className="px-3 py-3 text-[13px]"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {entry.field}
                  </td>
                  <td
                    className="px-3 py-3 text-[13px]"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {entry.previousValue}
                  </td>
                  <td
                    className="px-3 py-3 text-[13px]"
                    style={{
                      color: "var(--slds-g-color-text-default)",
                    }}
                  >
                    {entry.newValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Household Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px] rounded-[8px] bg-white border border-[#dddbda]">
          <DialogHeader className="border-b border-[#dddbda] pb-4">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              Edit Household Details
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b]">
              Update household information below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 px-6">
            <div className="space-y-4">
              {/* Removed Household ID field */}
              <div>
                <Label
                  htmlFor="householdSize"
                  className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
                >
                  Household Size
                </Label>
                <Input
                  id="householdSize"
                  type="number"
                  value={tempHouseholdSize}
                  onChange={(e) =>
                    setTempHouseholdSize(e.target.value)
                  }
                  className="h-9 text-[13px] border-[#dddbda]"
                  placeholder="Enter household size"
                />
              </div>
              <div>
                <Label
                  htmlFor="annualIncome"
                  className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
                >
                  Annual Income
                </Label>
                <Input
                  id="annualIncome"
                  value={tempAnnualIncome}
                  onChange={(e) =>
                    setTempAnnualIncome(e.target.value)
                  }
                  className="h-9 text-[13px] border-[#dddbda]"
                  placeholder="Enter annual income (e.g., $45,000)"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-[#dddbda] pt-4 px-6">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="h-9 rounded-full text-[13px] border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
            >
              Cancel
            </Button>
            <Button
              className="h-9 rounded-full text-[13px] bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
              onClick={handleSaveHousehold}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Entry Dialog */}
      <Dialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px] rounded-[8px] bg-white border border-[#dddbda]">
          <DialogHeader className="border-b border-[#dddbda] pb-4">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              {editingHistoryId
                ? "Edit History Entry"
                : "Add History Entry"}
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b]">
              {editingHistoryId
                ? "Edit the history entry below."
                : "Add a new history entry below."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 px-6">
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="modifyDateTime"
                  className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
                >
                  Modify Date/Time
                </Label>
                <Input
                  id="modifyDateTime"
                  value={historyFormData.modifyDateTime}
                  onChange={(e) =>
                    setHistoryFormData({
                      ...historyFormData,
                      modifyDateTime: e.target.value,
                    })
                  }
                  className="h-9 text-[13px] border-[#dddbda]"
                  placeholder="MM/DD/YYYY HH:MM AM/PM"
                />
              </div>
              <div>
                <Label
                  htmlFor="modifier"
                  className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
                >
                  Modifier
                </Label>
                <Input
                  id="modifier"
                  value={historyFormData.modifier}
                  onChange={(e) =>
                    setHistoryFormData({
                      ...historyFormData,
                      modifier: e.target.value,
                    })
                  }
                  className="h-9 text-[13px] border-[#dddbda]"
                  placeholder="Enter modifier name"
                />
              </div>
              <div>
                <Label
                  htmlFor="field"
                  className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
                >
                  Field
                </Label>
                <Input
                  id="field"
                  value={historyFormData.field}
                  onChange={(e) =>
                    setHistoryFormData({
                      ...historyFormData,
                      field: e.target.value,
                    })
                  }
                  className="h-9 text-[13px] border-[#dddbda]"
                  placeholder="Enter field name"
                />
              </div>
              <div>
                <Label
                  htmlFor="previousValue"
                  className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
                >
                  Previous Value
                </Label>
                <Input
                  id="previousValue"
                  value={historyFormData.previousValue}
                  onChange={(e) =>
                    setHistoryFormData({
                      ...historyFormData,
                      previousValue: e.target.value,
                    })
                  }
                  className="h-9 text-[13px] border-[#dddbda]"
                  placeholder="Enter previous value"
                />
              </div>
              <div>
                <Label
                  htmlFor="newValue"
                  className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
                >
                  New Value
                </Label>
                <Input
                  id="newValue"
                  value={historyFormData.newValue}
                  onChange={(e) =>
                    setHistoryFormData({
                      ...historyFormData,
                      newValue: e.target.value,
                    })
                  }
                  className="h-9 text-[13px] border-[#dddbda]"
                  placeholder="Enter new value"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-[#dddbda] pt-4 px-6">
            <Button
              variant="outline"
              onClick={() => setHistoryDialogOpen(false)}
              className="h-9 rounded-full text-[13px] border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
            >
              Cancel
            </Button>
            <Button
              className="h-9 rounded-full text-[13px] bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
              onClick={handleSaveHistory}
            >
              {editingHistoryId ? "Update" : "Add"} Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Household Detail Dialog */}
      <Dialog
        open={newDetailDialogOpen}
        onOpenChange={setNewDetailDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px] rounded-[8px] bg-white border border-[#dddbda]">
          <DialogHeader className="border-b border-[#dddbda] pb-4">
            <DialogTitle className="text-[16px] font-bold text-[#080707]">
              Add New Household Detail
            </DialogTitle>
            <DialogDescription className="text-[13px] text-[#706e6b]">
              Add a new household detail below.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 px-6">
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="householdSize"
                  className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
                >
                  HOUSEHOLD SIZE
                </Label>
                <Input
                  id="householdSize"
                  type="number"
                  value={newDetailFormData.householdSize}
                  onChange={(e) =>
                    setNewDetailFormData({
                      ...newDetailFormData,
                      householdSize: e.target.value,
                    })
                  }
                  className="h-9 text-[13px] border-[#dddbda]"
                  placeholder="Enter household size"
                />
              </div>
              <div>
                <Label
                  htmlFor="annualIncome"
                  className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
                >
                  ANNUAL INCOME
                </Label>
                <Input
                  id="annualIncome"
                  value={newDetailFormData.annualIncome}
                  onChange={(e) =>
                    setNewDetailFormData({
                      ...newDetailFormData,
                      annualIncome: e.target.value,
                    })
                  }
                  className="h-9 text-[13px] border-[#dddbda]"
                  placeholder="Enter annual income (e.g., $45,000)"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-[#dddbda] pt-4 px-6">
            <Button
              variant="outline"
              onClick={() => setNewDetailDialogOpen(false)}
              className="h-9 rounded-full text-[13px] border-[#dddbda] bg-white hover:bg-[#f3f2f2] shadow-none"
            >
              Cancel
            </Button>
            <Button
              className="h-9 rounded-full text-[13px] bg-[#145F33] hover:bg-[#0f4a26] text-white shadow-none"
              onClick={handleSaveNewDetail}
            >
              Add Detail
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}