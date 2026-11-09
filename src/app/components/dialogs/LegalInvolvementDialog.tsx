import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { X as XIcon } from "@/app/lib/lucide-icons";
import { DateInput } from "../ui/date-input";
import { isoToMdy, mdyToIso } from "../../lib/dateFormat";

export interface LegalInvolvementRecord {
  id: number;
  date: string;
  courtType: string;
  levelOfCrime: string;
  description: string;
  status: string;
}

interface LegalInvolvementDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    record:
      | Omit<LegalInvolvementRecord, "id">
      | LegalInvolvementRecord,
  ) => void;
  editingRecord?: LegalInvolvementRecord | null;
  mode: "view" | "edit" | "create";
}

export function LegalInvolvementDialog({
  open,
  onClose,
  onSave,
  editingRecord,
  mode,
}: LegalInvolvementDialogProps) {
  const [formData, setFormData] = useState({
    date: "",
    courtType: "",
    levelOfCrime: "",
    description: "",
    status: "",
  });

  const [errors, setErrors] = useState({
    date: "",
    courtType: "",
    levelOfCrime: "",
    status: "",
  });

  useEffect(() => {
    if (editingRecord) {
      setFormData({
        date: editingRecord.date,
        courtType: editingRecord.courtType,
        levelOfCrime: editingRecord.levelOfCrime,
        description: editingRecord.description,
        status: editingRecord.status,
      });
    } else {
      setFormData({
        date: "",
        courtType: "",
        levelOfCrime: "",
        description: "",
        status: "",
      });
    }
    setErrors({
      date: "",
      courtType: "",
      levelOfCrime: "",
      status: "",
    });
  }, [editingRecord, open]);

  const validateForm = () => {
    const newErrors = {
      date: "",
      courtType: "",
      levelOfCrime: "",
      status: "",
    };

    if (!formData.date.trim()) {
      newErrors.date = "Date is required";
    }
    if (!formData.courtType.trim()) {
      newErrors.courtType = "Court Type is required";
    }
    if (!formData.levelOfCrime.trim()) {
      newErrors.levelOfCrime = "Level of Crime is required";
    }
    if (!formData.status.trim()) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(
      (error) => error !== "",
    );
  };

  const handleSave = () => {
    if (mode === "view") {
      onClose();
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (editingRecord) {
      onSave({ ...editingRecord, ...formData });
    } else {
      onSave(formData);
    }
    onClose();
  };

  const isReadOnly = mode === "view";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle
              className="text-[15px] font-semibold"
              style={{
                color: "var(--slds-g-color-text-default)",
              }}
            >
              {mode === "create"
                ? "Create Legal Involvement"
                : mode === "edit"
                  ? "Edit Legal Involvement"
                  : "View Legal Involvement"}
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            ></button>
          </div>
          <DialogDescription className="sr-only">
            {mode === "create"
              ? "Create a new legal involvement record"
              : mode === "edit"
                ? "Edit legal involvement details"
                : "View legal involvement details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Date */}
          <div>
            <Label
              htmlFor="legal-date"
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Date <span className="text-red-600">*</span>
            </Label>
            <DateInput
              id="legal-date"
              value={isoToMdy(formData.date)}
              onChange={(v) =>
                ((e) =>
                  setFormData({
                    ...formData,
                    date: e.target.value,
                  }))({ target: { value: mdyToIso(v) } })
              }
              disabled={isReadOnly}
              className="text-[13px] h-9 rounded"
              style={{
                backgroundColor: isReadOnly
                  ? "var(--slds-g-color-neutral-95)"
                  : "var(--slds-g-color-background-base)",
                border: `1px solid ${errors.date ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                color: "var(--slds-g-color-text-default)",
              }}
            />
            {errors.date && (
              <p className="text-[11px] text-red-600 mt-1">
                {errors.date}
              </p>
            )}
          </div>

          {/* Court Type */}
          <div>
            <Label
              htmlFor="court-type"
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Court Type <span className="text-red-600">*</span>
            </Label>
            <select
              id="court-type"
              value={formData.courtType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  courtType: e.target.value,
                })
              }
              disabled={isReadOnly}
              className="text-[13px] h-9 rounded w-full px-3"
              style={{
                backgroundColor: isReadOnly
                  ? "var(--slds-g-color-neutral-95)"
                  : "var(--slds-g-color-background-base)",
                border: `1px solid ${errors.courtType ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                color: "var(--slds-g-color-text-default)",
              }}
            >
              <option value="">Select Court Type</option>
              <option value="Juvenile Court">Juvenile Court</option>
              <option value="Family Court">Family Court</option>
              <option value="Criminal Court">Criminal Court</option>
              <option value="Civil Court">Civil Court</option>
            </select>
            {errors.courtType && (
              <p className="text-[11px] text-red-600 mt-1">
                {errors.courtType}
              </p>
            )}
          </div>

          {/* Level of Crime */}
          <div>
            <Label
              htmlFor="level-crime"
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Level of Crime{" "}
              <span className="text-red-600">*</span>
            </Label>
            <select
              id="level-crime"
              value={formData.levelOfCrime}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  levelOfCrime: e.target.value,
                })
              }
              disabled={isReadOnly}
              className="text-[13px] h-9 rounded w-full px-3"
              style={{
                backgroundColor: isReadOnly
                  ? "var(--slds-g-color-neutral-95)"
                  : "var(--slds-g-color-background-base)",
                border: `1px solid ${errors.levelOfCrime ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                color: "var(--slds-g-color-text-default)",
              }}
            >
              <option value="">Select Level of Crime</option>
              <option value="Felony">Felony</option>
              <option value="Misdemeanor">Misdemeanor</option>
              <option value="Status Offense">Status Offense</option>
              <option value="Infraction">Infraction</option>
            </select>
            {errors.levelOfCrime && (
              <p className="text-[11px] text-red-600 mt-1">
                {errors.levelOfCrime}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label
              htmlFor="legal-description"
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Description
            </Label>
            <Textarea
              id="legal-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              disabled={isReadOnly}
              className="text-[13px] rounded min-h-[100px]"
              style={{
                backgroundColor: isReadOnly
                  ? "var(--slds-g-color-neutral-95)"
                  : "var(--slds-g-color-background-base)",
                border:
                  "1px solid var(--slds-g-color-border-base-1)",
                color: "var(--slds-g-color-text-default)",
              }}
              placeholder="Provide details about the legal involvement..."
            />
          </div>

          {/* Status */}
          <div>
            <Label
              htmlFor="legal-status"
              className="block text-[12px] font-semibold mb-1.5 uppercase"
              style={{ color: "var(--slds-g-color-text-weak)" }}
            >
              Status <span className="text-red-600">*</span>
            </Label>
            <select
              id="legal-status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value,
                })
              }
              disabled={isReadOnly}
              className="text-[13px] h-9 rounded w-full px-3"
              style={{
                backgroundColor: isReadOnly
                  ? "var(--slds-g-color-neutral-95)"
                  : "var(--slds-g-color-background-base)",
                border: `1px solid ${errors.status ? "#c23934" : "var(--slds-g-color-border-base-1)"}`,
                color: "var(--slds-g-color-text-default)",
              }}
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Resolved">Resolved</option>
              <option value="Pending">Pending</option>
            </select>
            {errors.status && (
              <p className="text-[11px] text-red-600 mt-1">
                {errors.status}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 pt-6 border-t"
          style={{
            borderColor: "var(--slds-g-color-border-base-1)",
          }}
        >
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 px-6 text-[13px] font-medium rounded-full"
            style={{
              backgroundColor: "var(--slds-g-color-neutral-95)",
              color: "var(--slds-g-color-text-default)",
              border:
                "1px solid var(--slds-g-color-border-base-1)",
            }}
          >
            {mode === "view" ? "Close" : "Cancel"}
          </Button>
          {mode !== "view" && (
            <Button
              onClick={handleSave}
              className="h-9 px-6 text-[13px] font-medium rounded-full"
              style={{
                backgroundColor: "#145F33",
                color: "white",
              }}
            >
              Save
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}