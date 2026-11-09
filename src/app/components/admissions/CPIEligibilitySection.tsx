import { useState } from "react";
import { Button } from "../ui/button";
import {
  Pencil,
  Trash2,
  Plus,
  ClipboardCheck,
} from "@/app/lib/lucide-icons";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { formatMdy } from "../../lib/dateFormat";

interface CPIEligibility {
  id: number;
  startDate: string;
  endDate: string;
  type: string;
  details: string;
  status: string;
  approvedBy?: string;
}

export function CPIEligibilitySection() {
  // CPI Eligibility Data
  const [cpiRecords, setCpiRecords] = useState<
    CPIEligibility[]
  >([
    {
      id: 1,
      startDate: "01/15/2024",
      endDate: "",
      type: "Initial Assessment",
      details: "Initial CPI eligibility assessment completed",
      status: "Eligible",
    },
    {
      id: 2,
      startDate: "11/15/2023",
      endDate: "01/14/2024",
      type: "Re-assessment",
      details: "Six-month re-assessment review",
      status: "Eligible",
    },
    {
      id: 3,
      startDate: "10/20/2023",
      endDate: "11/14/2023",
      type: "Initial Assessment",
      details: "Initial assessment pending documentation",
      status: "Under Review",
    },
  ]);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(
    null,
  );
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<
    number | null
  >(null);
  const [formData, setFormData] = useState<
    Omit<CPIEligibility, "id" | "approvedBy">
  >({
    startDate: "",
    endDate: "",
    type: "",
    details: "",
    status: "",
  });

  // CRUD handlers
  const handleNew = () => {
    setEditingId(null);
    setFormData({
      startDate: formatMdy(new Date()),
      endDate: "",
      type: "Initial Assessment",
      details: "",
      status: "Eligible",
    });
    setDialogOpen(true);
  };

  // Reviewer Approval — opens the edit modal pre-filled in review mode
  const handleReview = (record: CPIEligibility) => {
    setEditingId(record.id);
    setFormData({
      startDate: record.startDate,
      endDate: record.endDate,
      type: record.type,
      details: record.details,
      status: record.status,
    });
    setIsReviewMode(true);
    setDialogOpen(true);
  };

  const handleApprove = () => {
    if (editingId) {
      setCpiRecords(
        cpiRecords.map((r) =>
          r.id === editingId
            ? { ...r, ...formData, approvedBy: "Sarah Johnson" }
            : r,
        ),
      );
    }
    setDialogOpen(false);
    setEditingId(null);
    setIsReviewMode(false);
  };

  const handleDeny = () => {
    setDialogOpen(false);
    setEditingId(null);
    setIsReviewMode(false);
  };

  const handleEdit = (record: CPIEligibility) => {
    setEditingId(record.id);
    setFormData({
      startDate: record.startDate,
      endDate: record.endDate,
      type: record.type,
      details: record.details,
      status: record.status,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (
      !formData.startDate ||
      !formData.type ||
      !formData.status
    ) {
      return;
    }

    if (editingId) {
      setCpiRecords(
        cpiRecords.map((r) =>
          r.id === editingId ? { ...r, ...formData } : r,
        ),
      );
    } else {
      const newId =
        Math.max(...cpiRecords.map((r) => r.id), 0) + 1;
      setCpiRecords([
        { id: newId, ...formData },
        ...cpiRecords,
      ]);
    }

    setDialogOpen(false);
    setEditingId(null);
    setIsReviewMode(false);
  };

  const handleDelete = (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId !== null) {
      setCpiRecords(
        cpiRecords.filter(
          (record) => record.id !== deleteConfirmId,
        ),
      );
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* CPI Eligibility Card */}
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
            CPI Eligibility
          </h3>
          <Button
            onClick={handleNew}
            size="sm"
            className="h-8 px-3 text-[13px] rounded-full"
            style={{
              backgroundColor: "#145F33",
              color: "white",
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
        </div>

        {cpiRecords.length === 0 ? (
          <div className="p-8 text-center">
            <p
              className="text-[13px]"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              No CPI eligibility records yet. Click "New" to add
              one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    borderBottom:
                      "1px solid var(--slds-g-color-border-base-1)",
                    backgroundColor:
                      "var(--slds-g-color-background-alt)",
                  }}
                >
                  <th
                    className="px-4 py-3 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    START DATE
                  </th>
                  <th
                    className="px-4 py-3 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    END DATE
                  </th>
                  <th
                    className="px-4 py-3 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    TYPE
                  </th>
                  <th
                    className="px-4 py-3 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    DETAILS
                  </th>
                  <th
                    className="px-4 py-3 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    APPROVED BY
                  </th>
                  <th
                    className="px-4 py-3 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    STATUS
                  </th>
                  <th
                    className="px-4 py-3 text-left text-[11px] font-semibold"
                    style={{
                      color: "var(--slds-g-color-text-weak)",
                    }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {cpiRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    style={{
                      borderBottom:
                        index < cpiRecords.length - 1
                          ? "1px solid var(--slds-g-color-border-base-1)"
                          : "none",
                    }}
                  >
                    <td className="px-4 py-3 text-[13px] text-[#080707]">
                      {record.startDate}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#080707]">
                      {record.endDate || "-"}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#080707]">
                      {record.type}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#080707]">
                      {record.details}
                    </td>
                    {/* Approved By — display-only, populated after approval */}
                    <td
                      className="px-4 py-3 text-[13px]"
                      style={{
                        color: (record as any).approvedBy
                          ? "#145F33"
                          : "var(--slds-g-color-text-weak)",
                      }}
                    >
                      {(record as any).approvedBy || "—"}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-[#080707]">
                      {record.status}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4 text-[#706e6b]" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(record.id)
                          }
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-[#706e6b]" />
                        </button>
                        {/* Reviewer Approval — last in Actions */}
                        <button
                          onClick={() => handleReview(record)}
                          className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                          title="Reviewer Approval"
                        >
                          <ClipboardCheck
                            className="h-4 w-4"
                            style={{ color: "#0176d3" }}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CPI Eligibility Dialog — shared by Edit and Reviewer Approval */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            setIsReviewMode(false);
            setEditingId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isReviewMode
                ? "Reviewer Approval — CPI Eligibility"
                : editingId
                  ? "Edit CPI Eligibility"
                  : "New CPI Eligibility"}
            </DialogTitle>
            <DialogDescription>
              {isReviewMode
                ? "Review the pre-filled details and choose to Approve or Deny this CPI record."
                : editingId
                  ? "Update the CPI eligibility record."
                  : "Add a new CPI eligibility record."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[65vh] overflow-y-auto px-6">
            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="startDate"
                  className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
                >
                  Start Date *
                </Label>
                <Input
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startDate: e.target.value,
                    })
                  }
                  placeholder="MM/DD/YYYY"
                  className="h-9 text-[13px] border-[#dddbda]"
                />
              </div>
              <div>
                <Label
                  htmlFor="endDate"
                  className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
                >
                  End Date
                </Label>
                <Input
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      endDate: e.target.value,
                    })
                  }
                  placeholder="MM/DD/YYYY"
                  className="h-9 text-[13px] border-[#dddbda]"
                />
              </div>
              <div>
                <Label
                  htmlFor="type"
                  className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
                >
                  Type *
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger
                    id="type"
                    className="h-9 text-[13px] border-[#dddbda]"
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Initial Assessment">
                      Initial Assessment
                    </SelectItem>
                    <SelectItem value="Re-assessment">
                      Re-assessment
                    </SelectItem>
                    <SelectItem value="Restraint Details Type">
                      Restraint Details Type
                    </SelectItem>
                    <SelectItem value="Contraindicated - No Holds Approved">
                      Contraindicated - No Holds Approved
                    </SelectItem>
                    <SelectItem value="Contraindicated - Some Holds Approved">
                      Contraindicated - Some Holds Approved
                    </SelectItem>
                    <SelectItem value="Contraindicated - Modified Holds Approved">
                      Contraindicated - Modified Holds Approved
                    </SelectItem>
                    <SelectItem value="Approved - Child Control Position">
                      Approved - Child Control Position
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="details"
                  className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
                >
                  Details
                </Label>
                <Textarea
                  id="details"
                  value={formData.details}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      details: e.target.value,
                    })
                  }
                  placeholder="Enter CPI eligibility details..."
                  rows={3}
                  className="text-[13px] border-[#dddbda]"
                />
              </div>
              <div>
                <Label
                  htmlFor="status"
                  className="text-[13px] text-[#3e3e3c] font-medium mb-1.5 block"
                >
                  Status *
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger
                    id="status"
                    className="h-9 text-[13px] border-[#dddbda]"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Eligible">
                      Eligible
                    </SelectItem>
                    <SelectItem value="Ineligible">
                      Ineligible
                    </SelectItem>
                    <SelectItem value="Under Review">
                      Under Review
                    </SelectItem>
                    <SelectItem value="Pending">
                      Pending
                    </SelectItem>
                    <SelectItem value="Approved">
                      Approved
                    </SelectItem>
                    <SelectItem value="Denied">
                      Denied
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            {isReviewMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleDeny}
                  className="rounded-full"
                  style={{
                    borderColor: "#c23934",
                    color: "#c23934",
                  }}
                >
                  Deny
                </Button>
                <Button
                  onClick={handleApprove}
                  className="rounded-full"
                  style={{
                    backgroundColor: "#145F33",
                    color: "white",
                  }}
                >
                  Approve
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setIsReviewMode(false);
                    setEditingId(null);
                  }}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="rounded-full"
                  style={{ backgroundColor: "#145F33" }}
                >
                  {editingId ? "Save Changes" : "Create"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmId(null);
        }}
      >
        <DialogContent className="sm:max-w-[400px] rounded-[8px] bg-white border border-[#dddbda] p-0">
          <DialogHeader className="border-b border-[#dddbda] pb-3 px-5 pt-4 mb-0">
            <DialogTitle className="text-[14px] font-bold text-[#080707]">
              Delete CPI Record
            </DialogTitle>
            <DialogDescription
              className="text-[12px] mt-0.5"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="px-5 py-3">
            <p
              className="text-[13px]"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Are you sure you want to delete this CPI record?
            </p>
          </div>
          <DialogFooter className="border-t border-[#dddbda] px-5 py-3 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="rounded-full px-4 py-1.5 text-[13px] h-8"
              style={{
                borderColor: "#dddbda",
                color: "var(--slds-g-color-text-default)",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="rounded-full px-4 py-1.5 text-[13px] text-white h-8"
              style={{
                backgroundColor: "#ba0517",
                borderColor: "#ba0517",
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}